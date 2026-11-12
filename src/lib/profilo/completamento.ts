import { documenti, inModulo, isVisibile, sezioni, type IdSezione, type Sezione } from "@/lib/profilo/campi";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

/** Valori del modulo di una sezione, letti dal profilo o dall'immobile. */
export function valoriSezione(sezione: Sezione, profilo: Partial<Profilo>, immobile: Partial<Immobile> | null) {
  const origine = (sezione.tabella === "profiles" ? profilo : (immobile ?? {})) as Record<string, unknown>;
  const valori: Record<string, string> = {};
  for (const campo of sezione.campi) {
    if (campo.tipo === "documenti") {
      const risposte = (origine.documents ?? {}) as Record<string, string>;
      for (const d of documenti) valori[`documents.${d.codice}`] = risposte[d.codice] ?? "";
    } else valori[campo.nome] = inModulo(campo, origine[campo.nome]);
  }
  return valori;
}

export type Completamento = {
  percentuale: number;
  sezioni: { id: IdSezione; titolo: string; completa: boolean }[];
};

/** Percentuale = media delle frazioni compilate delle sezioni che contano (note escluse). */
export function calcolaCompletamento(profilo: Partial<Profilo>, immobile: Partial<Immobile> | null): Completamento {
  const risultato = sezioni
    .filter((s) => s.contaNelCompletamento)
    .map((sezione) => {
      const valori = valoriSezione(sezione, profilo, immobile);
      const campi = sezione.campi.filter((c) => isVisibile(c, valori));
      const compilati = campi.filter((c) =>
        c.tipo === "documenti" ? documenti.every((d) => valori[`documents.${d.codice}`]) : valori[c.nome] !== "",
      ).length;
      return { id: sezione.id, titolo: sezione.titolo, frazione: campi.length ? compilati / campi.length : 1 };
    });
  const media = risultato.reduce((somma, s) => somma + s.frazione, 0) / risultato.length;
  return {
    percentuale: Math.round(media * 100),
    sezioni: risultato.map(({ id, titolo, frazione }) => ({ id, titolo, completa: frazione === 1 })),
  };
}
