"use server";

import { revalidatePath } from "next/cache";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { sezionePerId, type IdSezione } from "@/lib/profilo/campi";
import { validaSezione } from "@/lib/profilo/validazione";
import { creaClientServer } from "@/lib/supabase/server";
import type { Database, Profilo } from "@/lib/supabase/tipi";

export type StatoSezione = {
  errori: Record<string, string>;
  inviati?: Record<string, string>;
  /** Momento dell'ultimo salvataggio riuscito (mostra "Salvato"). */
  salvatoIl?: number;
  erroreGenerale?: string;
};

/**
 * Salva una sezione del profilo. L'utente è sempre quello collegato (mai un
 * id dal browser); la RLS e i grant per colonna limitano comunque cosa può
 * scrivere. La riga dell'immobile nasce al primo salvataggio.
 */
export async function salvaSezione(idSezione: IdSezione, _stato: StatoSezione, formData: FormData): Promise<StatoSezione> {
  const sezione = sezionePerId(idSezione);
  if (!sezione) return { errori: {}, erroreGenerale: "Sezione non valida." };

  const { valori, errori, inviati } = validaSezione(sezione, formData);
  if (Object.keys(errori).length > 0) return { errori, inviati };

  const profilo = await leggiProfiloCorrente();
  const supabase = await creaClientServer();
  const { error } =
    sezione.tabella === "profiles"
      ? // I valori arrivano da `validaSezione`: solo colonne e valori ammessi della sezione.
        await supabase.from("profiles").update(valori as Partial<Profilo>).eq("id", profilo.id)
      : await supabase
          .from("properties")
          .upsert({ ...(valori as Database["public"]["Tables"]["properties"]["Update"]), user_id: profilo.id }, { onConflict: "user_id" });

  if (error) {
    console.error(`Salvataggio della sezione ${idSezione} non riuscito`, error);
    return { errori: {}, inviati, erroreGenerale: "Non siamo riusciti a salvare. Riprova tra poco." };
  }

  revalidatePath("/dashboard/profilo");
  revalidatePath("/dashboard");
  return { errori: {}, salvatoIl: Date.now() };
}
