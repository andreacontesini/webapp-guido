import type Stripe from "stripe";

import { cambiaStatoAcquisto, registraPagamento } from "@/lib/acquisti";
import { verificaEventoWebhook } from "@/lib/stripe";

/**
 * Webhook di Stripe: unico punto in cui un pagamento sblocca un contenuto
 * (mai lato client). Stripe può inviare lo stesso evento più volte: la
 * sessione di checkout è unica in `purchases`, quindi i duplicati non
 * creano un secondo acquisto né una seconda email.
 *
 * Eventi da attivare su Stripe: checkout.session.completed,
 * checkout.session.async_payment_succeeded, charge.refunded,
 * charge.dispute.created, charge.dispute.closed (vedi docs/stripe.md).
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
      case "charge.refunded":
        // Arriva anche per i rimborsi parziali: si revoca solo con rimborso totale.
        if (evento.data.object.refunded) {
          await cambiaStatoAcquisto(evento.data.object.payment_intent, "rimborsato");
        }
        break;
      case "charge.dispute.created":
        await cambiaStatoAcquisto(evento.data.object.payment_intent, "contestato");
        break;
      case "charge.dispute.closed":
        // Contestazione vinta (o semplice richiesta di informazioni chiusa):
        // l'acquisto torna valido. Se persa, resta contestato e senza accesso.
        if (["won", "warning_closed"].includes(evento.data.object.status)) {
          await cambiaStatoAcquisto(evento.data.object.payment_intent, "pagato");
        }
        break;
      default:
        break;
    }
  } catch (errore) {
    // 500: Stripe riproverà l'invio dell'evento.
    console.error(`Webhook Stripe: gestione di ${evento.type} non riuscita`, errore);
    return new Response("Errore interno", { status: 500 });
  }

  return Response.json({ ricevuto: true });
}
