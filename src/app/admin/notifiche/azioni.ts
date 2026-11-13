"use server";

import { revalidatePath } from "next/cache";

import { richiediAdmin } from "@/lib/auth/admin";
import { normalizzaEventi } from "@/lib/notifiche/eventi";
import { inviaNotificaProva } from "@/lib/notifiche/invia";
import { creaClientServer } from "@/lib/supabase/server";

/**
 * Gestione dei destinatari delle notifiche (/admin/notifiche). La RLS
 * consente lettura e scrittura solo agli admin; il controllo è ripetuto qui
 * perché le Server Action si possono invocare da qualsiasi pagina.
 */

const PERCORSO = "/admin/notifiche";
const formatoId = /^[0-9a-f-]{36}$/i;
const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EsitoAzione = { errore?: string; messaggio?: string };

export type StatoDestinatario = {
  errori: Partial<Record<"email" | "nome" | "eventi", string>>;
  valori?: { email: string; nome: string; eventi: string[] };
  erroreGenerale?: string;
  /** Momento del salvataggio riuscito (chiude il popup). */
  salvatoIl?: number;
};

/** Aggiunge un destinatario o ne modifica nome ed eventi (`id` presente). */
export async function salvaDestinatario(
  id: string | null,
  _stato: StatoDestinatario,
  formData: FormData,
): Promise<StatoDestinatario> {
  await richiediAdmin();
  if (id !== null && !formatoId.test(id)) return { errori: {}, erroreGenerale: "Destinatario non valido." };

  const valori = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    nome: String(formData.get("nome") ?? "").trim().replace(/\s+/g, " "),
    eventi: formData.getAll("eventi").map(String),
  };
  const eventi = normalizzaEventi(valori.eventi);

  const errori: StatoDestinatario["errori"] = {};
  if (id === null && (!formatoEmail.test(valori.email) || valori.email.length > 254)) {
    errori.email = "Inserisci un indirizzo email valido.";
  }
  if (valori.nome.length > 80) errori.nome = "Il nome è troppo lungo.";
  if (eventi.length === 0) errori.eventi = "Scegli almeno un evento da ricevere.";
  if (Object.keys(errori).length > 0) return { errori, valori };

  const supabase = await creaClientServer();
  const { error } =
    id === null
      ? await supabase
          .from("admin_notification_recipients")
          .insert({ email: valori.email, name: valori.nome || null, events: eventi })
      : await supabase
          .from("admin_notification_recipients")
          .update({ name: valori.nome || null, events: eventi })
          .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { errori: { email: "Questo indirizzo è già tra i destinatari." }, valori };
    }
    console.error("Salvataggio del destinatario delle notifiche non riuscito", error);
    return { errori: {}, valori, erroreGenerale: "Salvataggio non riuscito. Riprova." };
  }

  revalidatePath(PERCORSO);
  return { errori: {}, salvatoIl: Date.now() };
}

/** Mette in pausa o riattiva un destinatario (in pausa non riceve nulla). */
export async function impostaPausa(id: string, inPausa: boolean): Promise<EsitoAzione> {
  await richiediAdmin();
  if (!formatoId.test(id)) return { errore: "Destinatario non valido." };

  const supabase = await creaClientServer();
  const { data, error } = await supabase
    .from("admin_notification_recipients")
    .update({ paused: inPausa })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) {
    console.error("Pausa del destinatario non aggiornata", error);
    return { errore: "Modifica non riuscita. Riprova." };
  }
  revalidatePath(PERCORSO);
  return {};
}

export async function eliminaDestinatario(id: string): Promise<EsitoAzione> {
  await richiediAdmin();
  if (!formatoId.test(id)) return { errore: "Destinatario non valido." };

  const supabase = await creaClientServer();
  const { data, error } = await supabase.from("admin_notification_recipients").delete().eq("id", id).select("id");
  if (error || !data?.length) {
    console.error("Eliminazione del destinatario non riuscita", error);
    return { errore: "Eliminazione non riuscita. Riprova." };
  }
  revalidatePath(PERCORSO);
  return {};
}

/** Invia una notifica di prova al destinatario, anche se è in pausa. */
export async function inviaProva(id: string): Promise<EsitoAzione> {
  const admin = await richiediAdmin();
  if (!formatoId.test(id)) return { errore: "Destinatario non valido." };

  const supabase = await creaClientServer();
  const { data: destinatario } = await supabase
    .from("admin_notification_recipients")
    .select("email")
    .eq("id", id)
    .maybeSingle();
  if (!destinatario) return { errore: "Destinatario non trovato." };

  const nomeAdmin = [admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.email;
  const esito = await inviaNotificaProva(destinatario.email, nomeAdmin);
  revalidatePath(PERCORSO);
  if (esito.stato !== "inviata") {
    return { errore: `Invio non riuscito${esito.errore ? `: ${esito.errore.replace(/^[^:]+: /, "")}` : "."}` };
  }
  return { messaggio: `Notifica di prova inviata a ${destinatario.email}` };
}
