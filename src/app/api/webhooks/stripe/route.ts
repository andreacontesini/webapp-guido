import type Stripe from "stripe";

import { cambiaStatoAcquisto, clienteNotifica, registraPagamento } from "@/lib/acquisti";
import { notificaDopo, segnalaProblema } from "@/lib/notifiche/invia";
import { isCodiceProdotto } from "@/lib/prodotti";
import { verificaEventoWebhook } from "@/lib/stripe";

/**
 * Webhook di Stripe: unico punto in cui un pagamento sblocca un contenuto
 * (mai lato client). Stripe può inviare lo stesso evento più volte: la
 * sessione di checkout è unica in `purchases`, quindi i duplicati non
 * creano un secondo acquisto né una seconda email. Anche le notifiche agli
 * admin hanno una chiave unica per evento (vedi `src/lib/notifiche/`).
 *
 * Eventi da attivare su Stripe: checkout.session.completed,
 * checkout.session.async_payment_succeeded, checkout.session.async_payment_failed,
 * charge.refunded, charge.dispute.created, charge.dispute.closed (vedi docs/stripe.md).
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
        } else if (evento.type === "checkout.session.completed") {
          notificaPagamentoDifferito(evento.data.object, "in_elaborazione");
        }
        break;
      case "checkout.session.async_payment_failed":
        notificaPagamentoDifferito(evento.data.object, "non_riuscito");
        break;
      case "charge.refunded":
        // Arriva anche per i rimborsi parziali: si revoca solo con rimborso totale.
        if (evento.data.object.refunded) {
          const acquisto = await cambiaStatoAcquisto(evento.data.object.payment_intent, "rimborsato");
          if (acquisto) {
            notificaDopo({
              evento: "rimborso",
              cliente: await clienteNotifica(acquisto.user_id, acquisto.email),
              prodotto: acquisto.product,
              importoCentesimi: evento.data.object.amount_refunded,
              pagamento: acquisto.idPagamento,
            });
          }
        }
        break;
      case "charge.dispute.created": {
        const contestazione = evento.data.object;
        const acquisto = await cambiaStatoAcquisto(contestazione.payment_intent, "contestato");
        if (acquisto) {
          const scadenza = contestazione.evidence_details?.due_by;
          notificaDopo({
            evento: "contestazione_aperta",
            cliente: await clienteNotifica(acquisto.user_id, acquisto.email),
            prodotto: acquisto.product,
            importoCentesimi: contestazione.amount,
            contestazione: contestazione.id,
            motivo: contestazione.reason,
            scadenza: scadenza ? new Date(scadenza * 1000).toISOString() : null,
          });
        }
        break;
      }
      case "charge.dispute.closed": {
        // Contestazione vinta (o semplice richiesta di informazioni chiusa):
        // l'acquisto torna valido. Se persa, resta contestato e senza accesso.
        const contestazione = evento.data.object;
        const vinta = ["won", "warning_closed"].includes(contestazione.status);
        const acquisto = vinta
          ? await cambiaStatoAcquisto(contestazione.payment_intent, "pagato")
          : await cambiaStatoAcquisto(contestazione.payment_intent, "contestato");
        if (acquisto) {
          notificaDopo({
            evento: "contestazione_chiusa",
            cliente: await clienteNotifica(acquisto.user_id, acquisto.email),
            prodotto: acquisto.product,
            contestazione: contestazione.id,
            vinta,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (errore) {
    // 500: Stripe riproverà l'invio dell'evento.
    console.error(`Webhook Stripe: gestione di ${evento.type} non riuscita`, errore);
    segnalaProblema(`Errore del webhook Stripe (${evento.type})`, errore, `webhook:${evento.id}`);
    return new Response("Errore interno", { status: 500 });
  }

  return Response.json({ ricevuto: true });
}

/** Checkout completato senza incasso immediato (metodo differito) o pagamento differito fallito. */
function notificaPagamentoDifferito(sessione: Stripe.Checkout.Session, esito: "in_elaborazione" | "non_riuscito") {
  const prodotto = sessione.metadata?.prodotto;
  const email = (sessione.customer_details?.email ?? sessione.customer_email)?.trim().toLowerCase();
  if (!isCodiceProdotto(prodotto) || !email) return;
  notificaDopo({
    evento: "pagamento_in_attesa",
    cliente: {
      id: sessione.metadata?.user_id ?? sessione.client_reference_id ?? null,
      email,
      nome: sessione.customer_details?.name ?? null,
    },
    prodotto,
    importoCentesimi: sessione.amount_total ?? 0,
    sessione: sessione.id,
    esito,
  });
}
