/**
 * Richiesta di ricontatto dal profilo (Fase 9): il cliente chiede di essere
 * ricontattato da Guido per una consulenza, con note e preferenze. Contatto
 * preferito, orario e telefono sono gli stessi campi dei dati personali.
 * Modulo puro, testato in `ricontatto.test.ts`.
 */
import type { Profilo } from "@/lib/supabase/tipi";

export const MAX_NOTE_RICONTATTO = 1000;

export const opzioniContatto = [
  { valore: "telefono", etichetta: "Telefono" },
  { valore: "whatsapp", etichetta: "WhatsApp" },
  { valore: "email", etichetta: "Email" },
] as const;

export const opzioniOrario = [
  { valore: "mattina", etichetta: "Mattina" },
  { valore: "pomeriggio", etichetta: "Pomeriggio" },
  { valore: "sera", etichetta: "Sera" },
  { valore: "indifferente", etichetta: "Indifferente" },
] as const;

type Contatto = (typeof opzioniContatto)[number]["valore"];
type Orario = (typeof opzioniOrario)[number]["valore"];

export type ValoriRicontatto = {
  note: string;
  contatto: string;
  orario: string;
  telefono: string;
};

export type DatiRicontatto = {
  contact_request_notes: string | null;
  contact_preference: Contatto;
  contact_time: Orario | null;
  phone: string | null;
};

/** Come nel primo accesso: cifre, spazi, trattini, punti, parentesi e un "+" iniziale. */
const formatoTelefono = /^\+?[0-9 ().-]{6,20}$/;

const pulisci = (valore: FormDataEntryValue | null) => String(valore ?? "").trim();

/** Valida il modulo della richiesta: valori per il database o errori per campo. */
export function validaRicontatto(formData: FormData):
  | { dati: DatiRicontatto; valori: ValoriRicontatto }
  | { errori: Partial<Record<keyof ValoriRicontatto, string>>; valori: ValoriRicontatto } {
  const valori: ValoriRicontatto = {
    note: pulisci(formData.get("note")).replace(/\r\n/g, "\n"),
    contatto: pulisci(formData.get("contatto")),
    orario: pulisci(formData.get("orario")),
    telefono: pulisci(formData.get("telefono")).replace(/\s+/g, " "),
  };

  const errori: Partial<Record<keyof ValoriRicontatto, string>> = {};
  const contatto = opzioniContatto.find((o) => o.valore === valori.contatto)?.valore;
  const orario = opzioniOrario.find((o) => o.valore === valori.orario)?.valore;

  if (!contatto) errori.contatto = "Scegli come preferisci essere contattato.";
  if (valori.orario && !orario) errori.orario = "Scegli un orario valido.";
  if (valori.note.length > MAX_NOTE_RICONTATTO) {
    errori.note = `Le note possono avere al massimo ${MAX_NOTE_RICONTATTO} caratteri.`;
  }
  if (valori.telefono && !formatoTelefono.test(valori.telefono)) {
    errori.telefono = "Controlla il numero di telefono.";
  } else if (!valori.telefono && (contatto === "telefono" || contatto === "whatsapp")) {
    errori.telefono = "Per essere chiamato o scritto su WhatsApp serve il numero di telefono.";
  }

  if (Object.keys(errori).length > 0 || !contatto) return { errori, valori };
  return {
    valori,
    dati: {
      contact_request_notes: valori.note || null,
      contact_preference: contatto,
      contact_time: orario ?? null,
      phone: valori.telefono || null,
    },
  };
}

export type StatoRichiesta = "nessuna" | "in_attesa" | "gestita";

/** A che punto è la richiesta del cliente. */
export function statoRichiesta(
  profilo: Pick<Profilo, "contact_request_at" | "contact_request_handled_at">,
): StatoRichiesta {
  if (!profilo.contact_request_at) return "nessuna";
  const gestita =
    profilo.contact_request_handled_at &&
    new Date(profilo.contact_request_handled_at) >= new Date(profilo.contact_request_at);
  return gestita ? "gestita" : "in_attesa";
}
