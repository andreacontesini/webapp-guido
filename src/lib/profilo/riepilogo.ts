import { etichettaValore, isVisibile, sezioni } from "@/lib/profilo/campi";
import { valoriSezione } from "@/lib/profilo/completamento";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

export type GruppoRiepilogo = {
  titolo: string;
  /** `valore` null = non compilato. */
  righe: { etichetta: string; valore: string | null; multilinea: boolean }[];
};

/**
 * Dati del profilo in forma leggibile, sezione per sezione, per il popup
 * admin e il PDF. Le domande condizionali non pertinenti (es. "Quanti
 * proprietari?" per un proprietario unico) non compaiono.
 */
export function riepilogoProfilo(
  profilo: Partial<Profilo>,
  immobile: Partial<Immobile> | null,
): GruppoRiepilogo[] {
  return sezioni.map((sezione) => {
    const origine = (sezione.tabella === "profiles" ? profilo : (immobile ?? {})) as Record<string, unknown>;
    const valoriModulo = valoriSezione(sezione, profilo, immobile);
    return {
      titolo: sezione.titolo,
      righe: sezione.campi
        .filter((campo) => isVisibile(campo, valoriModulo))
        .map((campo) => ({
          etichetta: campo.etichetta,
          valore: etichettaValore(campo, origine[campo.nome]),
          multilinea: campo.tipo === "documenti" || (campo.tipo === "testo" && !!campo.multilinea),
        })),
    };
  });
}
