import "server-only";

import { cache } from "react";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { creaClientServer } from "@/lib/supabase/server";
import type { ImpostazioniGuida } from "@/lib/supabase/tipi";

/** Nome del bucket Storage privato che contiene il PDF. */
export const BUCKET_GUIDA = "guida";

export type StatoGuida =
  /** L'utente non ha il permesso (revocato dall'admin). */
  | { stato: "non-abilitata" }
  /** Permesso attivo ma il PDF non è ancora stato caricato. */
  | { stato: "in-preparazione"; impostazioni: ImpostazioniGuida }
  | { stato: "disponibile"; impostazioni: ImpostazioniGuida & { file_path: string } };

/**
 * Stato della guida per l'utente corrente. La RLS restituisce le impostazioni
 * solo a chi ha `guide_access`, ma controlliamo anche il profilo per chiarezza.
 */
export const leggiStatoGuida = cache(async (): Promise<StatoGuida> => {
  const profilo = await leggiProfiloCorrente();
  if (!profilo.guide_access) return { stato: "non-abilitata" };

  const supabase = await creaClientServer();
  const { data: impostazioni } = await supabase
    .from("guide_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (!impostazioni) return { stato: "non-abilitata" };
  if (!impostazioni.file_path) return { stato: "in-preparazione", impostazioni };
  return {
    stato: "disponibile",
    impostazioni: { ...impostazioni, file_path: impostazioni.file_path },
  };
});
