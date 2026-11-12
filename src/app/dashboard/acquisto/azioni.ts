"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { isIdLanding, registraEventoLanding } from "@/lib/landing/eventi";
import { isCodiceProdotto, prodotti } from "@/lib/prodotti";
import { acquistoDisponibile, stripe } from "@/lib/stripe";
import { creaClientServer } from "@/lib/supabase/server";
import { urlApp } from "@/lib/url";

export type EsitoCheckout = { errore?: string };

/** True se c'è una sessione di login (senza reindirizzare chi non ce l'ha). */
async function haSessione() {
  const supabase = await creaClientServer();
  const { data } = await supabase.auth.getClaims();
  return !!data?.claims;
}

/**
 * Crea una sessione di Stripe Checkout e porta alla pagina di pagamento
 * ospitata da Stripe (i dati della carta non passano mai dall'app). Lo
 * sblocco avviene nel webhook o nella pagina di conferma, dopo la verifica
 * del pagamento con Stripe.
 *
 * - Con login: email precompilata, ritorno nell'area riservata.
 * - Senza login (Fase 7): Stripe chiede l'email; dopo il pagamento l'account
 *   viene trovato o creato da quell'email e il ritorno è su `/acquisto/…`.
 */
export async function avviaCheckout(
  prodotto: string,
  /** Id della landing da cui parte l'acquisto, se c'è (misurazione conversioni). */
  origine?: string,
): Promise<EsitoCheckout> {
  if (!isCodiceProdotto(prodotto) || !acquistoDisponibile(prodotto)) {
    return { errore: "Il pagamento online non è ancora attivo." };
  }
  const scheda = prodotti[prodotto];
  const landingId = isIdLanding(origine) ? origine : undefined;
  const conLanding = landingId ? `&origine=${landingId}` : "";
  const base = urlApp();

  const profilo = (await haSessione()) ? await leggiProfiloCorrente() : null;
  if (profilo && prodotto === "guida" && profilo.guide_access) redirect(scheda.href);

  const metadati = {
    prodotto,
    ...(profilo ? { user_id: profilo.id } : { ospite: "1" }),
    ...(landingId ? { landing_id: landingId } : {}),
  };

  const parametriUtente: Partial<Stripe.Checkout.SessionCreateParams> = profilo
    ? {
        customer_email: profilo.email,
        client_reference_id: profilo.id,
        success_url: `${base}/dashboard/acquisto/conferma?prodotto=${prodotto}&session_id={CHECKOUT_SESSION_ID}`,
        // La landing di origine resta nell'URL: "Riprova" la riusa per le statistiche.
        cancel_url: `${base}/dashboard/acquisto/annullato?prodotto=${prodotto}${conLanding}`,
      }
    : {
        success_url: `${base}/acquisto/entra?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/acquisto/annullato?prodotto=${prodotto}${conLanding}`,
      };

  let urlPagamento: string | null = null;
  try {
    const sessione = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "it",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round((scheda.prezzo ?? 0) * 100),
            product_data: {
              name: `${scheda.nome} — ${scheda.titoloCompleto}`,
              description: scheda.descrizione,
            },
          },
        },
      ],
      metadata: metadati,
      payment_intent_data: {
        // Ricevuta automatica di Stripe (senza login: all'email inserita su Stripe,
        // se le ricevute sono attive nelle impostazioni dell'account).
        ...(profilo ? { receipt_email: profilo.email } : {}),
        metadata: metadati,
      },
      ...parametriUtente,
    });
    urlPagamento = sessione.url;
  } catch (errore) {
    console.error("Creazione sessione Stripe Checkout non riuscita", errore);
  }

  if (!urlPagamento) {
    return { errore: "Non siamo riusciti ad aprire la pagina di pagamento. Riprova tra poco." };
  }
  if (landingId) await registraEventoLanding(landingId, "checkout");
  redirect(urlPagamento);
}
