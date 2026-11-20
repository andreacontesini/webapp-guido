"use server";

import { normalizzaUnBlocco, type CampoContatto } from "@/lib/landing/blocchi";
import { isIdLanding, registraEventoLanding } from "@/lib/landing/eventi";
import type { RigaNotifica } from "@/lib/notifiche/eventi";
import { notificaDopo } from "@/lib/notifiche/invia";
import { creaClientAdmin } from "@/lib/supabase/admin";

/**
 * Invio del modulo di contatto di una landing pubblicata.
 *
 * La configurazione (campi, obbligatori, destinatari) si rilegge dal database:
 * dal browser arrivano solo i valori compilati, quindi nessuno può aggiungere
 * destinatari o saltare i controlli. Contro lo spam: campo trappola, tempo
 * minimo di compilazione e al massimo 3 invii in 10 minuti per la stessa
 * email o lo stesso telefono.
 */

export type StatoRichiestaLanding = {
  errori: Record<string, string>;
  valori?: Record<string, string>;
  erroreGenerale?: string;
  inviata?: boolean;
};

const MAX_LUNGHEZZA: Record<CampoContatto, number> = {
  nome: 120,
  email: 254,
  telefono: 30,
  citta: 80,
  messaggio: 2000,
};
const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formatoTelefono = /^\+?[0-9 ().-]{6,30}$/;
const TEMPO_MINIMO_MS = 2000;
const FINESTRA_INVII_MS = 10 * 60 * 1000;
const MAX_INVII_FINESTRA = 3;

const colonne: Record<CampoContatto, "full_name" | "email" | "phone" | "city" | "message"> = {
  nome: "full_name",
  email: "email",
  telefono: "phone",
  citta: "city",
  messaggio: "message",
};

export async function inviaRichiestaLanding(
  _stato: StatoRichiestaLanding,
  formData: FormData,
): Promise<StatoRichiestaLanding> {
  const landingId = String(formData.get("landing") ?? "");
  const bloccoId = String(formData.get("blocco") ?? "");
  const erroreGenerico: StatoRichiestaLanding = {
    errori: {},
    erroreGenerale: "Invio non riuscito. Riprova tra qualche minuto.",
  };
  if (!isIdLanding(landingId) || !bloccoId) return erroreGenerico;

  // Campo trappola compilato: si risponde "inviata" senza salvare nulla.
  if (String(formData.get("sito") ?? "").trim()) return { errori: {}, inviata: true };

  const client = creaClientAdmin();
  const { data: landing, error: erroreLanding } = await client
    .from("landing_pages")
    .select("id, title, blocks")
    .eq("id", landingId)
    .eq("status", "pubblicata")
    .maybeSingle();
  if (erroreLanding) console.error("Lettura della landing per il modulo non riuscita", erroreLanding);
  const tutti = Array.isArray(landing?.blocks) ? (landing.blocks as unknown[]) : [];
  const grezzo = tutti.find((b) => typeof b === "object" && b !== null && (b as { id?: unknown }).id === bloccoId);
  const blocco = normalizzaUnBlocco(grezzo, tutti);
  if (!landing || !blocco || blocco.tipo !== "modulo") return erroreGenerico;

  const valori: Record<string, string> = {};
  const errori: Record<string, string> = {};
  for (const { campo, etichetta, obbligatorio } of blocco.campi) {
    const grezzoCampo = String(formData.get(campo) ?? "");
    const valore = campo === "messaggio" ? grezzoCampo.trim() : grezzoCampo.trim().replace(/\s+/g, " ");
    valori[campo] = valore;
    if (!valore) {
      if (obbligatorio) errori[campo] = `Compila il campo «${etichetta}».`;
      continue;
    }
    if (valore.length > MAX_LUNGHEZZA[campo]) errori[campo] = `Massimo ${MAX_LUNGHEZZA[campo]} caratteri.`;
    else if (campo === "email" && !formatoEmail.test(valore)) errori[campo] = "Controlla l'indirizzo email.";
    else if (campo === "telefono" && !formatoTelefono.test(valore)) errori[campo] = "Controlla il numero di telefono.";
  }
  valori.privacy = formData.get("privacy") === "si" ? "si" : "";
  if (!valori.privacy) errori.privacy = "Per inviare la richiesta serve il consenso.";

  const email = valori.email?.toLowerCase() || null;
  const telefono = valori.telefono || null;
  if (!errori.email && !errori.telefono && !email && !telefono) {
    const campo = blocco.campi.some((c) => c.campo === "email") ? "email" : "telefono";
    errori[campo] = "Lascia almeno un recapito per essere ricontattato.";
  }
  if (Object.keys(errori).length) return { errori, valori };

  const apertoIl = Number(formData.get("aperto"));
  if (!Number.isFinite(apertoIl) || Date.now() - apertoIl < TEMPO_MINIMO_MS) {
    return { errori: {}, valori, erroreGenerale: "Attendi un istante e invia di nuovo." };
  }

  // Limite di invii ravvicinati dalla stessa persona.
  const dal = new Date(Date.now() - FINESTRA_INVII_MS).toISOString();
  const citato = (v: string) => `"${v.replace(/["\\]/g, "")}"`;
  const filtri = [email && `email.eq.${citato(email)}`, telefono && `phone.eq.${citato(telefono)}`].filter(Boolean);
  if (filtri.length) {
    const { count } = await client
      .from("landing_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dal)
      .or(filtri.join(","));
    if ((count ?? 0) >= MAX_INVII_FINESTRA) {
      return {
        errori: {},
        valori,
        erroreGenerale: "Abbiamo già ricevuto le tue richieste: ti ricontatteremo presto.",
      };
    }
  }

  const riga = {
    landing_id: landing.id,
    landing_title: landing.title,
    block_id: bloccoId,
    full_name: null as string | null,
    email: null as string | null,
    phone: null as string | null,
    city: null as string | null,
    message: null as string | null,
    consent_at: new Date().toISOString(),
  };
  for (const { campo } of blocco.campi) {
    if (valori[campo]) riga[colonne[campo]] = campo === "email" ? valori[campo].toLowerCase() : valori[campo];
  }

  const { data: salvata, error } = await client.from("landing_requests").insert(riga).select("id").single();
  if (error || !salvata) {
    console.error("Salvataggio della richiesta della landing non riuscito", error);
    return { errori: {}, valori, erroreGenerale: "Invio non riuscito. Riprova tra qualche minuto." };
  }

  await registraEventoLanding(landing.id, "contatto");
  const campi: RigaNotifica[] = blocco.campi.flatMap(({ campo, etichetta }) =>
    valori[campo] ? [{ etichetta, valore: valori[campo] }] : [],
  );
  notificaDopo({
    evento: "richiesta_landing",
    cliente: email ? { email, nome: riga.full_name } : null,
    richiesta: salvata.id,
    landing: landing.title,
    campi,
    destinatari: blocco.destinatari,
  });

  return { errori: {}, inviata: true };
}
