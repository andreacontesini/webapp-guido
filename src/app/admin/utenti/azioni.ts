"use server";

import { revalidatePath } from "next/cache";

import { richiediAdmin } from "@/lib/auth/admin";
import { creaClientAdmin } from "@/lib/supabase/admin";
import type { Profilo, RuoloUtente } from "@/lib/supabase/tipi";

export type EsitoAzione = { errore?: string };

const PERCORSO = "/admin/utenti";
const formatoId = /^[0-9a-f-]{36}$/i;

/**
 * Controlli comuni: chi chiama è admin e l'utente di destinazione esiste.
 * Ruolo, blocco ed eliminazione non si applicano al proprio account, per non
 * restare chiusi fuori dal back office.
 */
async function preparaModifica(id: string, { ancheSuSeStessi = false } = {}) {
  const admin = await richiediAdmin();
  if (!formatoId.test(id)) return { errore: "Utente non valido." } as const;
  if (!ancheSuSeStessi && id === admin.id) {
    return { errore: "Non puoi applicare questa modifica al tuo account." } as const;
  }
  return { client: creaClientAdmin() } as const;
}

async function aggiornaProfilo(
  id: string,
  campi: Partial<Pick<Profilo, "guide_access" | "is_blocked" | "role">>,
  opzioni?: { ancheSuSeStessi?: boolean },
): Promise<EsitoAzione> {
  const preparazione = await preparaModifica(id, opzioni);
  if ("errore" in preparazione) return { errore: preparazione.errore };

  const { data, error } = await preparazione.client
    .from("profiles")
    .update(campi)
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Modifica utente non riuscita", error);
    return { errore: "Modifica non riuscita. Riprova." };
  }
  revalidatePath(PERCORSO);
  return {};
}

/** Assegna o revoca l'accesso alla guida (anche a sé stessi). */
export async function impostaAccessoGuida(id: string, attivo: boolean) {
  return aggiornaProfilo(id, { guide_access: attivo }, { ancheSuSeStessi: true });
}

/** Blocca o sblocca un account: il proxy chiude subito le sue sessioni. */
export async function impostaBlocco(id: string, bloccato: boolean) {
  return aggiornaProfilo(id, { is_blocked: bloccato });
}

export async function impostaRuolo(id: string, ruolo: RuoloUtente) {
  if (ruolo !== "admin" && ruolo !== "cliente") return { errore: "Ruolo non valido." };
  return aggiornaProfilo(id, { role: ruolo });
}

/** Elimina l'account da Supabase Auth; il profilo viene cancellato a cascata. */
export async function eliminaUtente(id: string): Promise<EsitoAzione> {
  const preparazione = await preparaModifica(id);
  if ("errore" in preparazione) return { errore: preparazione.errore };

  const { error } = await preparazione.client.auth.admin.deleteUser(id);
  if (error) {
    console.error("Eliminazione utente non riuscita", error);
    return { errore: "Eliminazione non riuscita. Riprova." };
  }
  revalidatePath(PERCORSO);
  return {};
}
