import { createElement } from "react";
import type Stripe from "stripe";

import EmailConfermaAcquisto from "@/emails/conferma-acquisto";
import { inviaEmail } from "@/lib/email/invia";
import { isCodiceProdotto } from "@/lib/prodotti";
import { creaClientAdmin } from "@/lib/supabase/admin";
import { verificaEventoWebhook } from "@/lib/stripe";

/**
 * Webhook di Stripe: unico punto in cui un pagamento sblocca un contenuto
 * (mai lato client). Stripe può inviare lo stesso evento più volte: la
 * sessione di checkout è unica in `purchases`, quindi i duplicati non
 * creano un secondo acquisto né una seconda email.
 *
 * Eventi da attivare su Stripe: checkout.session.completed,
 * checkout.session.async_payment_succeeded (vedi docs/stripe.md).
 */
export async function POST(request: Request) {
  const firma = request.headers.get("stripe-signature");
  if (!firma) return new Response("Firma mancante", { status: 400 });

  let evento: Stripe.Event;
  try {
    evento = verificaEventoWebhook(await request.text(), firma);
  } catch (errore) {
    console.error("Webhook Stripe: firma non valida", errore);
    return new Response("Firma non valida", { status: 400 });
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        // Con metodi di pagamento differiti (es. bonifico) "completed" arriva
        // prima dell'incasso: si sblocca solo quando risulta pagato.
        if (evento.data.object.payment_status === "paid") {
          await registraPagamento(evento.data.object);
        }
        break;
      default:
        // Altri eventi (rimborsi, contestazioni) arriveranno con la Fase 6.
        break;
    }
  } catch (errore) {
    // 500: Stripe riproverà l'invio dell'evento.
    console.error(`Webhook Stripe: gestione di ${evento.type} non riuscita`, errore);
    return new Response("Errore interno", { status: 500 });
  }

  return Response.json({ ricevuto: true });
}

async function registraPagamento(sessione: Stripe.Checkout.Session) {
  const prodotto = sessione.metadata?.prodotto;
  if (!isCodiceProdotto(prodotto)) {
    throw new Error(`Prodotto non riconosciuto nella sessione ${sessione.id}`);
  }
  const userId = sessione.metadata?.user_id ?? sessione.client_reference_id ?? null;
  const email = sessione.customer_details?.email ?? sessione.customer_email;
  if (!email) throw new Error(`Email mancante nella sessione ${sessione.id}`);

  const client = creaClientAdmin();
  const pagatoIl = new Date().toISOString();
  const importo = sessione.amount_total ?? 0;

  // Inserisce solo se la sessione non è già registrata (evento duplicato).
  const { data: inseriti, error: erroreAcquisto } = await client
    .from("purchases")
    .upsert(
      {
        user_id: userId,
        email,
        product: prodotto,
        status: "pagato",
        amount_total: importo,
        currency: sessione.currency ?? "eur",
        stripe_checkout_session_id: sessione.id,
        stripe_payment_intent_id:
          typeof sessione.payment_intent === "string"
            ? sessione.payment_intent
            : (sessione.payment_intent?.id ?? null),
        paid_at: pagatoIl,
      },
      { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true },
    )
    .select("id");
  if (erroreAcquisto) throw erroreAcquisto;
  const nuovo = (inseriti?.length ?? 0) > 0;

  if (!userId) {
    // Acquisto senza account: creazione dell'account con la Fase 7.
    console.warn(`Webhook Stripe: acquisto ${sessione.id} senza utente, registrato senza sblocco`);
    return;
  }

  // Sblocco (idempotente: ripeterlo non cambia nulla).
  if (prodotto === "guida") {
    const { error: erroreSblocco } = await client
      .from("profiles")
      .update({ guide_access: true })
      .eq("id", userId);
    if (erroreSblocco) throw erroreSblocco;
  }

  if (!nuovo) return;

  const { data: profilo } = await client
    .from("profiles")
    .select("first_name")
    .eq("id", userId)
    .maybeSingle();

  try {
    await inviaEmail({
      a: email,
      oggetto: "Grazie per l'acquisto: la tua guida è pronta",
      email: createElement(EmailConfermaAcquisto, {
        prodotto,
        importoCentesimi: importo,
        pagatoIl,
        nome: profilo?.first_name ?? null,
      }),
      chiaveIdempotenza: `conferma-acquisto-${sessione.id}`,
    });
  } catch (errore) {
    // L'acquisto è già registrato e sbloccato: l'email non deve bloccare il webhook.
    console.error(`Webhook Stripe: email di conferma per ${sessione.id} non inviata`, errore);
  }
}
