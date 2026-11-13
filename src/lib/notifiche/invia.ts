import "server-only";

import { after } from "next/server";
import { createElement } from "react";

import EmailNotificaAdmin from "@/emails/notifica-admin";
import { inviaEmail } from "@/lib/email/invia";
import {
  chiaveDeduplica,
  contenutoNotifica,
  type ClienteNotifica,
  type ContenutoNotifica,
  type DatiEvento,
} from "@/lib/notifiche/eventi";
import { creaClientAdmin } from "@/lib/supabase/admin";
import type { StatoNotifica } from "@/lib/supabase/tipi";

/**
 * Invio centralizzato delle notifiche agli admin (Fase 9).
 *
 * - Ogni evento si registra nello storico con una chiave unica: se arriva di
 *   nuovo (webhook ripetuto, pagina di conferma e webhook insieme) non parte
 *   una seconda email.
 * - Un'email per destinatario (nessun indirizzo esposto agli altri), con il
 *   "Rispondi a" sull'email del cliente.
 * - Non lancia mai errori: la notifica non deve bloccare né far fallire
 *   l'operazione principale. Gli esiti restano nello storico.
 */

/** Giorni di storico conservati (e mostrati in /admin/notifiche). */
export const GIORNI_STORICO = 30;

/** Pausa tra due invii: il piano base di Resend accetta poche email al secondo. */
const PAUSA_TRA_INVII_MS = 600;
const attendi = (ms: number) => new Promise((risolvi) => setTimeout(risolvi, ms));

/** Notifica un evento agli admin che lo ricevono. Attende l'invio; non lancia errori. */
export async function notificaAdmin(dati: DatiEvento): Promise<void> {
  try {
    await esegui(dati);
  } catch (errore) {
    console.error(`Notifica agli admin "${dati.evento}" non riuscita`, errore);
  }
}

/**
 * Come `notificaAdmin`, ma dopo la risposta al browser (o a Stripe): chi
 * aspetta l'operazione principale non aspetta anche le email. Va chiamata
 * durante una richiesta (azioni, route, pagine).
 */
export function notificaDopo(dati: DatiEvento) {
  after(() => notificaAdmin(dati));
}

/** Scorciatoia per i problemi tecnici (email non partita, errore del webhook…). */
export function segnalaProblema(
  problema: string,
  errore: unknown,
  chiave: string,
  cliente?: ClienteNotifica | null,
) {
  const dettaglio = errore instanceof Error ? errore.message : String(errore);
  notificaDopo({ evento: "problema_tecnico", problema, dettaglio, chiave, cliente: cliente ?? null });
}

async function esegui(dati: DatiEvento) {
  const client = creaClientAdmin();
  const contenuto = contenutoNotifica(dati);
  const cliente = dati.cliente ?? null;

  const riga = {
    event: dati.evento,
    dedupe_key: chiaveDeduplica(dati),
    subject: contenuto.oggetto.slice(0, 200),
    user_id: cliente?.id ?? null,
    customer_email: cliente?.email ?? null,
    data: dati,
  };
  let { data: registrata, error } = await client.from("admin_notification_log").insert(riga).select("id").single();
  // 23503: l'utente non esiste più (es. account appena eliminato): si registra senza collegamento.
  if (error?.code === "23503") {
    ({ data: registrata, error } = await client
      .from("admin_notification_log")
      .insert({ ...riga, user_id: null })
      .select("id")
      .single());
  }
  // 23505: evento già notificato.
  if (error?.code === "23505") return;
  if (error || !registrata) throw error ?? new Error("Registrazione nello storico non riuscita");

  const { data: destinatari, error: erroreDestinatari } = await client
    .from("admin_notification_recipients")
    .select("email")
    .eq("paused", false)
    .contains("events", [dati.evento]);
  if (erroreDestinatari) {
    await aggiornaEsito(registrata.id, "non_inviata", [], erroreDestinatari.message);
    throw erroreDestinatari;
  }

  const indirizzi = (destinatari ?? []).map((d) => d.email);
  const esito = await inviaATutti(indirizzi, contenuto, cliente?.email ?? null, `notifica-${registrata.id}`);
  await aggiornaEsito(registrata.id, esito.stato, esito.inviati, esito.errore);
  await pulisciStorico();
}

type EsitoInvio = { stato: StatoNotifica; inviati: string[]; errore: string | null };

async function inviaATutti(
  indirizzi: string[],
  contenuto: ContenutoNotifica,
  emailCliente: string | null,
  chiave: string,
  prova = false,
): Promise<EsitoInvio> {
  if (indirizzi.length === 0) return { stato: "nessun_destinatario", inviati: [], errore: null };

  const inviati: string[] = [];
  const errori: string[] = [];
  for (const [i, a] of indirizzi.entries()) {
    if (i > 0) await attendi(PAUSA_TRA_INVII_MS);
    try {
      await inviaEmail({
        a,
        oggetto: prova ? `[Prova] ${contenuto.oggetto}` : contenuto.oggetto,
        email: createElement(EmailNotificaAdmin, { contenuto, emailCliente, prova }),
        rispondiA: emailCliente ?? undefined,
        chiaveIdempotenza: `${chiave}-${a}`,
      });
      inviati.push(a);
    } catch (errore) {
      errori.push(`${a}: ${errore instanceof Error ? errore.message : String(errore)}`);
    }
  }

  const stato: StatoNotifica = errori.length === 0 ? "inviata" : inviati.length > 0 ? "parziale" : "non_inviata";
  return { stato, inviati, errore: errori.length ? errori.join("\n").slice(0, 2000) : null };
}

async function aggiornaEsito(id: number, stato: StatoNotifica, inviati: string[], errore: string | null) {
  const { error } = await creaClientAdmin()
    .from("admin_notification_log")
    .update({ status: stato, recipients: inviati, error: errore })
    .eq("id", id);
  if (error) console.error("Aggiornamento dello storico delle notifiche non riuscito", error);
}

/** Cancella lo storico più vecchio di 30 giorni (a ogni invio: poche righe, nessun cron). */
async function pulisciStorico() {
  const limite = new Date(Date.now() - GIORNI_STORICO * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await creaClientAdmin().from("admin_notification_log").delete().lt("created_at", limite);
  if (error) console.error("Pulizia dello storico delle notifiche non riuscita", error);
}

/**
 * Notifica di prova a un destinatario (da /admin/notifiche), anche se è in
 * pausa: serve a verificare che l'indirizzo riceva. Registrata nello storico.
 */
export async function inviaNotificaProva(email: string, richiestaDa: string): Promise<EsitoInvio> {
  const contenuto: ContenutoNotifica = {
    oggetto: "Notifica di prova",
    titolo: "Le notifiche funzionano",
    testo: `Questa è una notifica di prova inviata da ${richiestaDa} dalla sezione Notifiche dell'amministrazione. Se la leggi, l'indirizzo riceve correttamente le email dell'app.`,
    righe: [
      { etichetta: "Destinatario", valore: email },
      {
        etichetta: "Inviata il",
        valore: new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Rome" }).format(new Date()),
      },
    ],
    urgente: false,
  };

  const client = creaClientAdmin();
  const { data: registrata, error } = await client
    .from("admin_notification_log")
    .insert({ event: "prova", subject: `[Prova] ${contenuto.oggetto}`, data: { richiestaDa } })
    .select("id")
    .single();
  if (error || !registrata) {
    console.error("Registrazione della notifica di prova non riuscita", error);
    return { stato: "non_inviata", inviati: [], errore: "Registrazione nello storico non riuscita." };
  }

  const esito = await inviaATutti([email], contenuto, null, `prova-${registrata.id}`, true);
  await aggiornaEsito(registrata.id, esito.stato, esito.inviati, esito.errore);
  return esito;
}
