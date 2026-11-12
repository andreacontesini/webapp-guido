import "server-only";

import Stripe from "stripe";

import { prodotti, type CodiceProdotto } from "@/lib/prodotti";

/**
 * Client Stripe (solo lato server).
 * Finché l'account Stripe del cliente non è configurato le chiavi in
 * `.env.local` sono segnaposto: `pagamentiAttivi()` resta falso e l'app
 * mostra il popup di acquisto senza pulsante di pagamento.
 */

const formatoChiave = /^sk_(test|live)_[A-Za-z0-9]{20,}$/;

/** True se la chiave segreta Stripe è una chiave vera (test o live). */
export function pagamentiAttivi() {
  return formatoChiave.test(process.env.STRIPE_SECRET_KEY ?? "");
}

let client: Stripe | null = null;

export function stripe() {
  const chiave = process.env.STRIPE_SECRET_KEY;
  if (!chiave || !pagamentiAttivi()) {
    throw new Error("Stripe non configurato: imposta STRIPE_SECRET_KEY");
  }
  client ??= new Stripe(chiave, {
    appInfo: { name: "Vendere Casa da Privato" },
  });
  return client;
}

/**
 * Verifica la firma del webhook e restituisce l'evento.
 * Non serve la chiave segreta: basta il segreto del webhook.
 */
export function verificaEventoWebhook(corpo: string, firma: string) {
  const segreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!segreto) throw new Error("STRIPE_WEBHOOK_SECRET mancante");
  return Stripe.webhooks.constructEvent(corpo, firma, segreto);
}

/**
 * True se il prodotto si può acquistare online: Stripe configurato e prezzo
 * definito. Il videocorso diventerà acquistabile con la Fase 16.
 */
export function acquistoDisponibile(prodotto: CodiceProdotto) {
  return prodotto === "guida" && prodotti[prodotto].prezzo !== null && pagamentiAttivi();
}
