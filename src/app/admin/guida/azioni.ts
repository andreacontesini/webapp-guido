"use server";

import { revalidatePath } from "next/cache";

import { richiediAdmin } from "@/lib/auth/admin";
import { BUCKET_GUIDA } from "@/lib/guida";
import { creaClientAdmin } from "@/lib/supabase/admin";
import { creaClientServer } from "@/lib/supabase/server";

/** Limite del bucket `guida` (vedi migrazione storage). */
const DIMENSIONE_MAX = 50 * 1024 * 1024;
/** Nome dei file caricati: `guida-<timestamp>.pdf`. */
const formatoPercorso = /^guida-\d{13}\.pdf$/;

const aggiornaPagine = () => {
  revalidatePath("/admin/guida");
  revalidatePath("/dashboard", "layout");
};

// -------------------------------------------------------------
// Dettagli della guida
// -------------------------------------------------------------

type CampoDettagli = "titolo" | "descrizione" | "versione";

export type StatoDettagli = {
  errori: Partial<Record<CampoDettagli, string>>;
  valori: Record<CampoDettagli, string>;
  messaggio?: { tipo: "successo" | "errore"; testo: string };
};

const testo = (formData: FormData, chiave: string) =>
  String(formData.get(chiave) ?? "").trim().replace(/\s+/g, " ");

export async function salvaDettagli(
  _statoPrecedente: StatoDettagli,
  formData: FormData,
): Promise<StatoDettagli> {
  const admin = await richiediAdmin();
  const valori = {
    titolo: testo(formData, "titolo"),
    descrizione: testo(formData, "descrizione"),
    versione: testo(formData, "versione"),
  };

  const errori: StatoDettagli["errori"] = {};
  if (valori.titolo.length < 2) errori.titolo = "Inserisci il titolo della guida.";
  if (valori.titolo.length > 120) errori.titolo = "Il titolo è troppo lungo (max 120 caratteri).";
  if (valori.descrizione.length > 300) {
    errori.descrizione = "La descrizione è troppo lunga (max 300 caratteri).";
  }
  if (valori.versione.length > 20) errori.versione = "La versione è troppo lunga.";
  if (Object.keys(errori).length > 0) return { errori, valori };

  // La RLS consente la modifica di guide_settings solo agli admin.
  const supabase = await creaClientServer();
  const { data, error } = await supabase
    .from("guide_settings")
    .update({
      title: valori.titolo,
      description: valori.descrizione || null,
      version: valori.versione || null,
      updated_by: admin.id,
    })
    .eq("id", 1)
    .select("id");

  if (error || !data?.length) {
    console.error("Salvataggio dettagli guida non riuscito", error);
    return {
      errori: {},
      valori,
      messaggio: { tipo: "errore", testo: "Salvataggio non riuscito. Riprova." },
    };
  }

  aggiornaPagine();
  return { errori: {}, valori, messaggio: { tipo: "successo", testo: "Dettagli salvati." } };
}

// -------------------------------------------------------------
// Caricamento del PDF
// Il file va dal browser direttamente a Supabase Storage con un URL
// firmato: così non passa dalle funzioni di Vercel (limite ~4,5 MB).
// -------------------------------------------------------------

export type EsitoPreparazione =
  | { percorso: string; token: string; errore?: never }
  | { errore: string };

/** Crea l'URL firmato per caricare un nuovo PDF nel bucket privato. */
export async function preparaCaricamento(file: {
  tipo: string;
  dimensione: number;
}): Promise<EsitoPreparazione> {
  await richiediAdmin();
  if (file.tipo !== "application/pdf") return { errore: "Il file deve essere un PDF." };
  if (!(file.dimensione > 0) || file.dimensione > DIMENSIONE_MAX) {
    return { errore: "Il PDF deve pesare al massimo 50 MB." };
  }

  const percorso = `guida-${Date.now()}.pdf`;
  const { data, error } = await creaClientAdmin()
    .storage.from(BUCKET_GUIDA)
    .createSignedUploadUrl(percorso);

  if (error || !data) {
    console.error("URL di caricamento non creato", error);
    return { errore: "Non è stato possibile avviare il caricamento. Riprova." };
  }
  return { percorso: data.path, token: data.token };
}

/**
 * Dopo il caricamento: verifica che il file esista, lo rende la guida attiva
 * e cancella il PDF precedente.
 */
export async function confermaCaricamento(percorso: string): Promise<{ errore?: string }> {
  const admin = await richiediAdmin();
  if (!formatoPercorso.test(percorso)) return { errore: "File non valido." };

  const client = creaClientAdmin();
  const storage = client.storage.from(BUCKET_GUIDA);

  // `exists` lancia un'eccezione per errori diversi da "file non trovato".
  const esiste = await storage
    .exists(percorso)
    .then(({ data }) => data)
    .catch((errore) => {
      console.error("Verifica del file caricato non riuscita", errore);
      return false;
    });
  if (!esiste) return { errore: "Il file caricato non è stato trovato. Riprova." };

  const { data: attuali } = await client
    .from("guide_settings")
    .select("file_path")
    .eq("id", 1)
    .maybeSingle();

  const { error } = await client
    .from("guide_settings")
    .update({ file_path: percorso, updated_by: admin.id })
    .eq("id", 1);

  if (error) {
    console.error("Aggiornamento file guida non riuscito", error);
    await storage.remove([percorso]);
    return { errore: "Non è stato possibile attivare il nuovo PDF. Riprova." };
  }

  const precedente = attuali?.file_path;
  if (precedente && precedente !== percorso) {
    const { error: erroreRimozione } = await storage.remove([precedente]);
    if (erroreRimozione) console.error("PDF precedente non rimosso", erroreRimozione);
  }

  aggiornaPagine();
  return {};
}
