import "server-only";

import { createElement } from "react";
import type Stripe from "stripe";

import EmailConfermaAcquisto from "@/emails/conferma-acquisto";
import { inviaEmail } from "@/lib/email/invia";
import { registraEventoLanding } from "@/lib/landing/eventi";
import { isCodiceProdotto } from "@/lib/prodotti";
import { stripe } from "@/lib/stripe";
import { creaClientAdmin } from "@/lib/supabase/admin";

/**
 * Registrazione degli acquisti e allineamento dell'accesso ai contenuti.
 * Usato dal webhook di Stripe e dalla pagina di conferma (che verifica la
 * sessione con Stripe lato server): le due strade possono arrivare insieme,
 * per questo ogni operazione è idempotente.
 */

/**
 * Registra una sessione di Checkout pagata: riga in `purchases` (una sola per
 * sessione), sblocco del prodotto ed email di conferma (solo al primo inserimento).
 */
export async function registraPagamento(sessione: Stripe.Checkout.Session) {
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

  // Acquisto partito da una landing: conta come conversione (una sola volta).
  const landingId = sessione.metadata?.landing_id;
  if (nuovo && landingId) await registraEventoLanding(landingId, "acquisto");

  if (!userId) {
    // Acquisto senza account: creazione dell'account con la Fase 7.
    console.warn(`Webhook Stripe: acquisto ${sessione.id} senza utente, registrato senza sblocco`);
    return;
  }

  // Sblocco (idempotente). Non forza `true`: se l'acquisto è stato poi
  // rimborsato, un evento ripetuto o la pagina di conferma riaperta non
  // devono restituire l'accesso.
  if (prodotto === "guida") await allineaAccessoGuida(userId);

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

type StatoAcquisto = "pagato" | "rimborsato" | "contestato";

/**
 * Aggiorna lo stato dell'acquisto legato a un pagamento (rimborso,
 * contestazione o contestazione vinta) e allinea l'accesso al prodotto.
 * Idempotente: ripetere lo stesso evento non cambia nulla.
 */
export async function cambiaStatoAcquisto(
  paymentIntent: string | Stripe.PaymentIntent | null,
  stato: StatoAcquisto,
) {
  const idPagamento = typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;
  if (!idPagamento) return;

  const client = creaClientAdmin();
  const { data: acquisto, error } = await client
    .from("purchases")
    .update({ status: stato })
    .eq("stripe_payment_intent_id", idPagamento)
    .select("user_id, product")
    .maybeSingle();
  if (error) throw error;
  if (!acquisto) {
    // Pagamento non fatto dall'app (es. creato a mano nel pannello Stripe).
    console.warn(`Webhook Stripe: nessun acquisto per il pagamento ${idPagamento}`);
    return;
  }

  if (acquisto.user_id && acquisto.product === "guida") {
    await allineaAccessoGuida(acquisto.user_id);
  }
}

/**
 * L'accesso alla guida resta solo se l'utente ha almeno un acquisto della
 * guida ancora pagato. Se viene rimborsato o contestato l'unico acquisto,
 * l'accesso si revoca (anche se in passato era stato assegnato a mano:
 * l'admin può riassegnarlo dalla scheda utente).
 */
async function allineaAccessoGuida(userId: string) {
  const client = creaClientAdmin();
  const { count, error } = await client
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("product", "guida")
    .eq("status", "pagato");
  if (error) throw error;

  const { error: erroreAccesso } = await client
    .from("profiles")
    .update({ guide_access: (count ?? 0) > 0 })
    .eq("id", userId);
  if (erroreAccesso) throw erroreAccesso;
}

export type EsitoSessione =
  /** Pagamento confermato e acquisto valido: contenuto sbloccato. */
  | "pagato"
  /** Checkout completato ma pagamento non ancora incassato (metodi differiti). */
  | "in-elaborazione"
  /** Sessione sconosciuta, di un altro utente, scaduta o acquisto non più valido. */
  | "non-verificata";

/**
 * Verifica con Stripe la sessione di Checkout indicata nell'URL di ritorno.
 * Il `session_id` arriva dal browser, quindi conta solo ciò che risponde
 * Stripe e solo se la sessione appartiene all'utente collegato. Se risulta
 * pagata registra subito l'acquisto, senza aspettare il webhook.
 */
export async function verificaSessioneCheckout(
  sessionId: string,
  userId: string,
): Promise<EsitoSessione> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return "non-verificata";

  let sessione: Stripe.Checkout.Session;
  try {
    sessione = await stripe().checkout.sessions.retrieve(sessionId);
  } catch (errore) {
    console.error(`Conferma acquisto: sessione ${sessionId} non leggibile`, errore);
    return "non-verificata";
  }

  const proprietario = sessione.metadata?.user_id ?? sessione.client_reference_id;
  if (proprietario !== userId) return "non-verificata";

  if (sessione.status === "complete" && sessione.payment_status === "unpaid") {
    return "in-elaborazione";
  }
  if (sessione.payment_status !== "paid") return "non-verificata";

  await registraPagamento(sessione);

  // L'acquisto può essere stato rimborsato o contestato nel frattempo.
  const { data: acquisto } = await creaClientAdmin()
    .from("purchases")
    .select("status")
    .eq("stripe_checkout_session_id", sessione.id)
    .maybeSingle();
  return acquisto?.status === "pagato" ? "pagato" : "non-verificata";
}
