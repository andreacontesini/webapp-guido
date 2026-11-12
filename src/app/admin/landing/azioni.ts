"use server";

import { revalidatePath, updateTag } from "next/cache";

import { richiediAdmin } from "@/lib/auth/admin";
import { TAG_LANDING } from "@/lib/landing/dati";
import { creaClientServer } from "@/lib/supabase/server";

export type EsitoAzione = { errore?: string };

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Aggiorna subito le pagine pubbliche (cache) e l'elenco in admin. */
const aggiornaPagine = () => {
  updateTag(TAG_LANDING);
  revalidatePath("/admin/landing");
};

/**
 * Pubblica o ritira una landing. Ritirando la landing della pagina iniziale,
 * la pagina iniziale torna quella predefinita.
 */
export async function impostaPubblicazione(id: string, pubblicata: boolean): Promise<EsitoAzione> {
  const admin = await richiediAdmin();
  if (!isUuid(id)) return { errore: "Landing non valida." };

  // La RLS consente le modifiche solo agli admin.
  const supabase = await creaClientServer();
  const { data, error } = await supabase
    .from("landing_pages")
    .update(
      pubblicata
        ? { status: "pubblicata", published_at: new Date().toISOString(), updated_by: admin.id }
        : { status: "bozza", is_home: false, updated_by: admin.id },
    )
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Pubblicazione landing non riuscita", error);
    return { errore: "Operazione non riuscita. Riprova." };
  }
  aggiornaPagine();
  return {};
}

/** Usa la landing come pagina iniziale (o, con `null`, torna a quella predefinita). */
export async function impostaPaginaIniziale(id: string | null): Promise<EsitoAzione> {
  await richiediAdmin();
  if (id !== null && !isUuid(id)) return { errore: "Landing non valida." };

  const supabase = await creaClientServer();
  const { error } = await supabase.rpc("imposta_landing_iniziale", { landing_id: id });

  if (error) {
    console.error("Scelta pagina iniziale non riuscita", error);
    return {
      errore: "Operazione non riuscita: la landing deve essere pubblicata. Riprova.",
    };
  }
  aggiornaPagine();
  return {};
}
