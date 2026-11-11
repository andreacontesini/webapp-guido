"use server";

import { redirect } from "next/navigation";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { isCodiceProdotto, prodotti } from "@/lib/prodotti";
import { acquistoDisponibile, stripe } from "@/lib/stripe";
import { urlApp } from "@/lib/url";

export type EsitoCheckout = { errore?: string };

/**
 * Crea una sessione di Stripe Checkout per l'utente corrente e lo porta
 * alla pagina di pagamento ospitata da Stripe (i dati della carta non
 * passano mai dall'app). Lo sblocco avviene solo nel webhook.
 */
export async function avviaCheckout(prodotto: string): Promise<EsitoCheckout> {
  const profilo = await leggiProfiloCorrente();

  if (!isCodiceProdotto(prodotto) || !acquistoDisponibile(prodotto)) {
    return { errore: "Il pagamento online non è ancora attivo." };
  }
  const scheda = prodotti[prodotto];
  if (prodotto === "guida" && profilo.guide_access) redirect(scheda.href);

  const base = urlApp();
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
      customer_email: profilo.email,
      client_reference_id: profilo.id,
      metadata: { user_id: profilo.id, prodotto },
      payment_intent_data: {
        // Ricevuta automatica di Stripe all'email dell'utente.
        receipt_email: profilo.email,
        metadata: { user_id: profilo.id, prodotto },
      },
      success_url: `${base}/dashboard/acquisto/conferma?prodotto=${prodotto}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/dashboard/acquisto/annullato?prodotto=${prodotto}`,
    });
    urlPagamento = sessione.url;
  } catch (errore) {
    console.error("Creazione sessione Stripe Checkout non riuscita", errore);
  }

  if (!urlPagamento) {
    return { errore: "Non siamo riusciti ad aprire la pagina di pagamento. Riprova tra poco." };
  }
  redirect(urlPagamento);
}
