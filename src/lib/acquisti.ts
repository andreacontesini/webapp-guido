import "server-only";

import { createElement } from "react";
import type Stripe from "stripe";

import EmailConfermaAcquisto from "@/emails/conferma-acquisto";
import { inviaEmail } from "@/lib/email/invia";
import { registraEventoLanding } from "@/lib/landing/eventi";
import { generaLinkAccesso } from "@/lib/auth/link-accesso";
import { PERCORSO_INIZIALE } from "@/lib/auth/percorsi";
import type { ClienteNotifica } from "@/lib/notifiche/eventi";
import { notificaDopo, segnalaProblema } from "@/lib/notifiche/invia";
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
  const emailStripe = sessione.customer_details?.email ?? sessione.customer_email;
  if (!emailStripe) throw new Error(`Email mancante nella sessione ${sessione.id}`);
  const email = emailStripe.trim().toLowerCase();

  // Acquisto senza account (Fase 7): l'account si trova o si crea dall'email
  // inserita su Stripe, prima di registrare l'acquisto.
  const ospite = isSessioneOspite(sessione);
  const userId =
    sessione.metadata?.user_id ??
    sessione.client_reference_id ??
    (ospite ? await trovaOCreaAccount(email, sessione.customer_details?.name) : null);

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

  if (nuovo) {
    notificaDopo({
      evento: "acquisto",
      cliente: await clienteNotifica(userId, email),
      prodotto,
      importoCentesimi: importo,
      sessione: sessione.id,
      landing: landingId ? await slugLanding(landingId) : null,
      senzaAccount: ospite,
    });
  }

  if (!userId) {
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
    // Chi ha acquistato senza account riceve un link che lo fa entrare subito.
    const urlAccesso = ospite ? await generaLinkAccesso(email, PERCORSO_INIZIALE) : undefined;
    await inviaEmail({
      a: email,
      oggetto: "Grazie per l'acquisto: la tua guida è pronta",
      email: createElement(EmailConfermaAcquisto, {
        prodotto,
        importoCentesimi: importo,
        pagatoIl,
        urlAccesso,
        nome: profilo?.first_name ?? null,
      }),
      chiaveIdempotenza: `conferma-acquisto-${sessione.id}`,
    });
  } catch (errore) {
    // L'acquisto è già registrato e sbloccato: l'email non deve bloccare il webhook.
    console.error(`Webhook Stripe: email di conferma per ${sessione.id} non inviata`, errore);
    segnalaProblema("Email di conferma dell'acquisto non partita", errore, `conferma-acquisto:${sessione.id}`, {
      id: userId,
      email,
      nome: profilo?.first_name ?? null,
    });
  }
}

/** Nome e cognome del cliente per le notifiche agli admin (l'email c'è sempre). */
export async function clienteNotifica(userId: string | null, email: string): Promise<ClienteNotifica> {
  if (!userId) return { id: null, email };
  const { data } = await creaClientAdmin()
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  const nome = [data?.first_name, data?.last_name].filter(Boolean).join(" ");
  return { id: userId, email, nome: nome || null };
}

/** Indirizzo della landing di provenienza, per la notifica d'acquisto. */
async function slugLanding(id: string) {
  const { data } = await creaClientAdmin().from("landing_pages").select("slug").eq("id", id).maybeSingle();
  return data?.slug ?? null;
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
  if (!idPagamento) return null;

  const client = creaClientAdmin();
  const { data: acquisto, error } = await client
    .from("purchases")
    .update({ status: stato })
    .eq("stripe_payment_intent_id", idPagamento)
    .select("user_id, email, product, amount_total")
    .maybeSingle();
  if (error) throw error;
  if (!acquisto) {
    // Pagamento non fatto dall'app (es. creato a mano nel pannello Stripe).
    console.warn(`Webhook Stripe: nessun acquisto per il pagamento ${idPagamento}`);
    return null;
  }

  if (acquisto.user_id && acquisto.product === "guida") {
    await allineaAccessoGuida(acquisto.user_id);
  }
  return { ...acquisto, idPagamento };
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

/** Sessione di Checkout aperta senza login (dalle landing o senza sessione). */
export function isSessioneOspite(sessione: Stripe.Checkout.Session) {
  return sessione.metadata?.ospite === "1";
}

/**
 * Account per l'email inserita su Stripe: quello esistente se c'è, altrimenti
 * uno nuovo già confermato (il profilo nasce dal trigger del database).
 * Privacy e dati personali si completano al primo accesso (/benvenuto).
 * Webhook e pagina di conferma possono arrivare insieme: se l'altro ha appena
 * creato l'account, lo si rilegge.
 */
async function trovaOCreaAccount(email: string, nomeCompleto?: string | null) {
  const client = creaClientAdmin();
  const cerca = async () => {
    const { data, error } = await client
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  };

  const esistente = await cerca();
  if (esistente) return esistente;

  const { data: creazione, error } = await client.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error || !creazione.user) {
    // Con due creazioni simultanee Supabase può rispondere "email_exists" o un
    // generico errore del database: in entrambi i casi l'account c'è già.
    const id = await cerca();
    if (id) return id;
    throw error ?? new Error(`Creazione dell'account per l'acquisto non riuscita`);
  }

  // Nome e cognome da Stripe (se presenti) per precompilare il primo accesso.
  const [nome, ...cognome] = (nomeCompleto ?? "").trim().split(/\s+/);
  if (nome) {
    await client
      .from("profiles")
      .update({ first_name: nome.slice(0, 80), last_name: cognome.join(" ").slice(0, 80) || null })
      .eq("id", creazione.user.id);
  }
  notificaDopo({
    evento: "nuovo_account",
    cliente: { id: creazione.user.id, email, nome: nomeCompleto?.trim() || null },
    origine: "acquisto",
    guidaAttiva: true,
  });
  return creazione.user.id;
}

export type EsitoSessioneOspite =
  | { esito: "pagato"; email: string; accessoImmediato: boolean }
  | { esito: "in-elaborazione"; email: string | null }
  | { esito: "non-verificata" };

/** Entro quanto tempo dal pagamento la pagina di conferma può far entrare direttamente. */
const FINESTRA_ACCESSO_IMMEDIATO_MS = 2 * 60 * 60 * 1000;

/**
 * Verifica con Stripe una sessione di acquisto senza account e la registra
 * subito se pagata. `accessoImmediato` è vero solo se l'account è nato da
 * questo acquisto e non è mai stato usato (privacy non ancora accettata):
 * chi conosce il `session_id` non può così entrare in un account esistente
 * di cui ha solo digitato l'email. In quel caso l'accesso passa dal link
 * inviato via email.
 */
export async function verificaSessioneOspite(sessionId: string): Promise<EsitoSessioneOspite> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return { esito: "non-verificata" };

  let sessione: Stripe.Checkout.Session;
  try {
    sessione = await stripe().checkout.sessions.retrieve(sessionId);
  } catch (errore) {
    console.error(`Conferma acquisto: sessione ${sessionId} non leggibile`, errore);
    return { esito: "non-verificata" };
  }
  if (!isSessioneOspite(sessione)) return { esito: "non-verificata" };

  const email = sessione.customer_details?.email?.trim().toLowerCase() ?? null;
  if (sessione.status === "complete" && sessione.payment_status === "unpaid") {
    return { esito: "in-elaborazione", email };
  }
  if (sessione.payment_status !== "paid" || !email) return { esito: "non-verificata" };

  await registraPagamento(sessione);

  const client = creaClientAdmin();
  const { data: acquisto } = await client
    .from("purchases")
    .select("status, user_id")
    .eq("stripe_checkout_session_id", sessione.id)
    .maybeSingle();
  if (acquisto?.status !== "pagato" || !acquisto.user_id) return { esito: "non-verificata" };

  const { data: profilo } = await client
    .from("profiles")
    .select("created_at, privacy_accepted_at, is_blocked")
    .eq("id", acquisto.user_id)
    .maybeSingle();

  const inizioSessione = sessione.created * 1000;
  const accessoImmediato =
    !!profilo &&
    !profilo.is_blocked &&
    !profilo.privacy_accepted_at &&
    new Date(profilo.created_at).getTime() >= inizioSessione &&
    Date.now() - inizioSessione < FINESTRA_ACCESSO_IMMEDIATO_MS;

  return { esito: "pagato", email, accessoImmediato };
}
