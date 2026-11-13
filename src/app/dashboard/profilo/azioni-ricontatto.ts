"use server";

import { revalidatePath } from "next/cache";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { notificaDopo } from "@/lib/notifiche/invia";
import { statoRichiesta, validaRicontatto, type ValoriRicontatto } from "@/lib/profilo/ricontatto";
import { creaClientServer } from "@/lib/supabase/server";

export type StatoRicontatto = {
  errori: Partial<Record<keyof ValoriRicontatto, string>>;
  valori?: ValoriRicontatto;
  /** Esito riuscito: "inviata" (nuova richiesta) o "aggiornata". */
  esito?: "inviata" | "aggiornata" | "annullata";
  /** Momento dell'esito: distingue due invii uguali di seguito. */
  il?: number;
  erroreGenerale?: string;
};

/**
 * Invia (o aggiorna) la richiesta di essere ricontattato da Guido. Solo una
 * nuova richiesta notifica gli admin; aggiornare note e preferenze di una
 * richiesta ancora aperta salva e basta. L'utente è sempre quello collegato.
 */
export async function inviaRichiestaRicontatto(_stato: StatoRicontatto, formData: FormData): Promise<StatoRicontatto> {
  const esito = validaRicontatto(formData);
  if ("errori" in esito) return { errori: esito.errori, valori: esito.valori };

  const profilo = await leggiProfiloCorrente();
  const nuova = statoRichiesta(profilo) !== "in_attesa";
  const inviataIl = new Date().toISOString();

  const supabase = await creaClientServer();
  const { error } = await supabase
    .from("profiles")
    .update({ ...esito.dati, ...(nuova ? { contact_request_at: inviataIl } : {}) })
    .eq("id", profilo.id);
  if (error) {
    console.error("Salvataggio della richiesta di ricontatto non riuscito", error);
    return { errori: {}, valori: esito.valori, erroreGenerale: "Non siamo riusciti a inviare la richiesta. Riprova tra poco." };
  }

  if (nuova) {
    notificaDopo({
      evento: "richiesta_ricontatto",
      cliente: {
        id: profilo.id,
        email: profilo.email,
        nome: [profilo.first_name, profilo.last_name].filter(Boolean).join(" ") || null,
      },
      telefono: esito.dati.phone,
      contatto: esito.dati.contact_preference,
      orario: esito.dati.contact_time,
      note: esito.dati.contact_request_notes,
      inviataIl,
    });
  }

  revalidatePath("/dashboard/profilo");
  return { errori: {}, esito: nuova ? "inviata" : "aggiornata", il: Date.now() };
}

/** Ritira una richiesta ancora aperta (le preferenze di contatto restano nel profilo). */
export async function annullaRichiestaRicontatto(): Promise<StatoRicontatto> {
  const profilo = await leggiProfiloCorrente();
  if (statoRichiesta(profilo) !== "in_attesa") return { errori: {} };

  const supabase = await creaClientServer();
  const { error } = await supabase
    .from("profiles")
    .update({ contact_request_at: null, contact_request_notes: null })
    .eq("id", profilo.id);
  if (error) {
    console.error("Annullamento della richiesta di ricontatto non riuscito", error);
    return { errori: {}, erroreGenerale: "Non siamo riusciti ad annullare la richiesta. Riprova tra poco." };
  }

  revalidatePath("/dashboard/profilo");
  return { errori: {}, esito: "annullata", il: Date.now() };
}
