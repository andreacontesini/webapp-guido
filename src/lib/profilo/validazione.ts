import { documenti, isVisibile, type Campo, type Sezione } from "@/lib/profilo/campi";
import type { Documenti, RispostaDocumento } from "@/lib/supabase/tipi";

export type EsitoValidazione = {
  /** Valori pronti per il database (colonne della sezione). */
  valori: Record<string, unknown>;
  /** Messaggi per campo (chiave = nome del campo). */
  errori: Record<string, string>;
  /** Valori così come inviati, per ricompilare il modulo dopo un errore. */
  inviati: Record<string, string>;
};

const risposteValide: RispostaDocumento[] = ["si", "no", "non_so"];
/** Cifre con separatori italiani (punti, spazi) e unità finali tollerate. */
const formatoIntero = /^-?\d+$/;

function leggiInviati(sezione: Sezione, formData: FormData) {
  const inviati: Record<string, string> = {};
  for (const campo of sezione.campi) {
    if (campo.tipo === "documenti") {
      for (const d of documenti) inviati[`documents.${d.codice}`] = String(formData.get(`documents.${d.codice}`) ?? "");
    } else {
      inviati[campo.nome] = String(formData.get(campo.nome) ?? "");
    }
  }
  return inviati;
}

function validaCampo(campo: Campo, grezzo: string, inviati: Record<string, string>): { valore: unknown; errore?: string } {
  switch (campo.tipo) {
    case "testo": {
      const testo = campo.multilinea ? grezzo.trim() : grezzo.trim().replace(/\s+/g, " ");
      if (!testo) return { valore: null };
      if (testo.length > campo.max) return { valore: null, errore: `Massimo ${campo.max} caratteri.` };
      if (campo.nome === "phone" && !/^\+?[0-9 ().-]{6,20}$/.test(testo)) {
        return { valore: null, errore: "Controlla il numero di telefono." };
      }
      return { valore: testo };
    }
    case "intero": {
      const senzaUnita = grezzo.replace(/\s|€|m²|mq/gi, "");
      if (!senzaUnita) return { valore: null };
      // Il punto è un separatore delle migliaia solo a gruppi di tre ("250.000"):
      // "85.5" è un decimale e non deve diventare 855.
      const pulito = /^-?\d{1,3}(\.\d{3})+$/.test(senzaUnita) ? senzaUnita.replace(/\./g, "") : senzaUnita;
      if (!formatoIntero.test(pulito)) return { valore: null, errore: "Inserisci un numero intero." };
      const numero = Number(pulito);
      if (numero < campo.min || numero > campo.max) {
        return { valore: null, errore: `Inserisci un valore tra ${campo.min} e ${campo.max}.` };
      }
      return { valore: numero };
    }
    case "scelta":
      if (!grezzo) return { valore: null };
      return campo.opzioni.some((o) => o.valore === grezzo)
        ? { valore: grezzo }
        : { valore: null, errore: "Scegli una delle opzioni." };
    case "sino":
      if (grezzo === "si") return { valore: true };
      if (grezzo === "no") return { valore: false };
      return { valore: null };
    case "data": {
      if (!grezzo) return { valore: null };
      const data = new Date(`${grezzo}T12:00:00Z`);
      const valida = /^\d{4}-\d{2}-\d{2}$/.test(grezzo) && !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === grezzo;
      return valida ? { valore: grezzo } : { valore: null, errore: "Inserisci una data valida." };
    }
    case "documenti": {
      const risposte: Documenti = {};
      for (const d of documenti) {
        const r = inviati[`documents.${d.codice}`];
        if (!r) continue;
        if (!risposteValide.includes(r as RispostaDocumento)) return { valore: {}, errore: "Risposta non valida." };
        risposte[d.codice] = r as RispostaDocumento;
      }
      return { valore: risposte };
    }
  }
}

/** Legge e valida i campi di una sezione; i campi condizionali non applicabili diventano null. */
export function validaSezione(sezione: Sezione, formData: FormData): EsitoValidazione {
  const inviati = leggiInviati(sezione, formData);
  const valori: Record<string, unknown> = {};
  const errori: Record<string, string> = {};

  for (const campo of sezione.campi) {
    if (!isVisibile(campo, inviati)) {
      valori[campo.nome] = null;
      continue;
    }
    const { valore, errore } = validaCampo(campo, inviati[campo.nome] ?? "", inviati);
    if (errore) errori[campo.nome] = errore;
    else if (campo.obbligatorio && (valore === null || (typeof valore === "string" && valore.length < 2))) {
      errori[campo.nome] = `Inserisci ${campo.etichetta.toLowerCase()}.`;
    } else valori[campo.nome] = valore;
  }
  return { valori, errori, inviati };
}
