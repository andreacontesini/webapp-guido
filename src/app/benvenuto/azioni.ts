"use server";

import { redirect } from "next/navigation";

import { PERCORSO_INIZIALE } from "@/lib/auth/percorsi";
import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { notificaDopo } from "@/lib/notifiche/invia";
import { creaClientServer } from "@/lib/supabase/server";

type Campo = "nome" | "cognome" | "telefono" | "privacy";

export type StatoBenvenuto = {
  errori: Partial<Record<Campo, string>>;
  valori: { nome: string; cognome: string; telefono: string; marketing: boolean };
  erroreGenerale?: string;
};

const testo = (formData: FormData, chiave: string) =>
  String(formData.get(chiave) ?? "").trim().replace(/\s+/g, " ");

/** Accetta cifre, spazi, trattini, punti, parentesi e un "+" iniziale. */
const formatoTelefono = /^\+?[0-9 ().-]{6,20}$/;

/** Salva i dati richiesti al primo accesso e apre l'area riservata. */
export async function salvaDatiIniziali(
  _statoPrecedente: StatoBenvenuto,
  formData: FormData,
): Promise<StatoBenvenuto> {
  const valori = {
    nome: testo(formData, "nome"),
    cognome: testo(formData, "cognome"),
    telefono: testo(formData, "telefono"),
    marketing: formData.has("marketing"),
  };
  const privacy = formData.has("privacy");

  const errori: StatoBenvenuto["errori"] = {};
  if (valori.nome.length < 2) errori.nome = "Inserisci il tuo nome.";
  if (valori.cognome.length < 2) errori.cognome = "Inserisci il tuo cognome.";
  if (valori.nome.length > 80) errori.nome = "Il nome è troppo lungo.";
  if (valori.cognome.length > 80) errori.cognome = "Il cognome è troppo lungo.";
  if (valori.telefono && !formatoTelefono.test(valori.telefono)) {
    errori.telefono = "Controlla il numero di telefono.";
  }
  if (!privacy) errori.privacy = "Per continuare devi accettare l'informativa privacy.";

  if (Object.keys(errori).length > 0) return { errori, valori };

  const profilo = await leggiProfiloCorrente();
  const supabase = await creaClientServer();
  const adesso = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: valori.nome,
      last_name: valori.cognome,
      phone: valori.telefono || null,
      marketing_consent: valori.marketing,
      privacy_accepted_at: adesso,
      onboarded_at: adesso,
    })
    .eq("id", profilo.id);

  if (error) {
    console.error("Salvataggio dati iniziali non riuscito", error);
    return {
      errori: {},
      valori,
      erroreGenerale: "Non siamo riusciti a salvare i dati. Riprova tra poco.",
    };
  }

  notificaDopo({
    evento: "primo_accesso",
    cliente: { id: profilo.id, email: profilo.email, nome: `${valori.nome} ${valori.cognome}` },
    telefono: valori.telefono || null,
    marketing: valori.marketing,
  });

  redirect(PERCORSO_INIZIALE);
}
