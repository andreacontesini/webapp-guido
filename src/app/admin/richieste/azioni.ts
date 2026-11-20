"use server";

import { revalidatePath } from "next/cache";

import { richiediAdmin } from "@/lib/auth/admin";
import { creaClientServer } from "@/lib/supabase/server";

/**
 * Gestione delle richieste arrivate dai moduli delle landing. La RLS consente
 * lettura, modifica ed eliminazione solo agli admin; il controllo è ripetuto
 * qui perché le Server Action si possono invocare da qualsiasi pagina.
 */

export type EsitoAzione = { errore?: string };

const formatoId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const aggiorna = () => {
  revalidatePath("/admin/richieste");
  revalidatePath("/admin");
};

/** Segna una richiesta come gestita (o la riporta "da gestire"). */
export async function impostaGestita(id: string, gestita: boolean): Promise<EsitoAzione> {
  const admin = await richiediAdmin();
  if (!formatoId.test(id)) return { errore: "Richiesta non valida." };

  const supabase = await creaClientServer();
  const { data, error } = await supabase
    .from("landing_requests")
    .update(gestita ? { handled_at: new Date().toISOString(), handled_by: admin.id } : { handled_at: null, handled_by: null })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) {
    console.error("Aggiornamento della richiesta non riuscito", error);
    return { errore: "Modifica non riuscita. Riprova." };
  }
  aggiorna();
  return {};
}

/** Elimina definitivamente una richiesta (es. spam o dati da cancellare su richiesta). */
export async function eliminaRichiesta(id: string): Promise<EsitoAzione> {
  await richiediAdmin();
  if (!formatoId.test(id)) return { errore: "Richiesta non valida." };

  const supabase = await creaClientServer();
  const { data, error } = await supabase.from("landing_requests").delete().eq("id", id).select("id");
  if (error || !data?.length) {
    console.error("Eliminazione della richiesta non riuscita", error);
    return { errore: "Eliminazione non riuscita. Riprova." };
  }
  aggiorna();
  return {};
}
