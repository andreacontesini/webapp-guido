"use server";

import { revalidatePath } from "next/cache";
import { createElement } from "react";

import EmailAccountCreato from "@/emails/account-creato";
import { richiediAdmin } from "@/lib/auth/admin";
import { inviaEmail } from "@/lib/email/invia";
import { generaLinkAccesso } from "@/lib/auth/link-accesso";
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

// -------------------------------------------------------------
// Creazione di un utente dal back office
// -------------------------------------------------------------

type CampoNuovoUtente = "email" | "nome" | "cognome" | "telefono";

export type StatoNuovoUtente = {
  errori: Partial<Record<CampoNuovoUtente, string>>;
  valori: {
    email: string;
    nome: string;
    cognome: string;
    telefono: string;
    guida: boolean;
    admin: boolean;
    invia: boolean;
  };
  erroreGenerale?: string;
  /** Valorizzato a creazione riuscita: messaggio da mostrare all'admin. */
  creato?: { email: string; avviso?: string };
};

const testo = (formData: FormData, chiave: string) =>
  String(formData.get(chiave) ?? "").trim().replace(/\s+/g, " ");

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Come nel modulo di benvenuto: cifre, spazi, trattini, punti, parentesi e "+". */
const formatoTelefono = /^\+?[0-9 ().-]{6,20}$/;

/**
 * Crea un account già confermato. Il profilo nasce dal trigger del database;
 * qui si completano dati, permessi e ruolo. Privacy e onboarding restano da
 * fare all'utente al primo accesso (pagina /benvenuto, con i dati precompilati).
 * Se richiesto, invia un'email con un link di accesso personale.
 */
export async function creaUtente(
  _statoPrecedente: StatoNuovoUtente,
  formData: FormData,
): Promise<StatoNuovoUtente> {
  await richiediAdmin();

  const valori = {
    email: testo(formData, "email").toLowerCase(),
    nome: testo(formData, "nome"),
    cognome: testo(formData, "cognome"),
    telefono: testo(formData, "telefono"),
    guida: formData.has("guida"),
    admin: formData.has("admin"),
    invia: formData.has("invia"),
  };

  const errori: StatoNuovoUtente["errori"] = {};
  if (!formatoEmail.test(valori.email) || valori.email.length > 254) {
    errori.email = "Inserisci un indirizzo email valido.";
  }
  if (valori.nome.length > 80) errori.nome = "Il nome è troppo lungo.";
  if (valori.cognome.length > 80) errori.cognome = "Il cognome è troppo lungo.";
  if (valori.telefono && !formatoTelefono.test(valori.telefono)) {
    errori.telefono = "Controlla il numero di telefono.";
  }
  if (Object.keys(errori).length > 0) return { errori, valori };

  const client = creaClientAdmin();

  const { data: creazione, error: erroreCreazione } = await client.auth.admin.createUser({
    email: valori.email,
    email_confirm: true,
  });
  if (erroreCreazione || !creazione.user) {
    const giaPresente =
      erroreCreazione?.code === "email_exists" ||
      /already been registered|already exists/i.test(erroreCreazione?.message ?? "");
    if (!giaPresente) console.error("Creazione utente non riuscita", erroreCreazione);
    return {
      errori: giaPresente ? { email: "Esiste già un account con questa email." } : {},
      valori,
      erroreGenerale: giaPresente ? undefined : "Creazione non riuscita. Riprova.",
    };
  }

  const id = creazione.user.id;
  const { error: erroreProfilo } = await client
    .from("profiles")
    .update({
      first_name: valori.nome || null,
      last_name: valori.cognome || null,
      phone: valori.telefono || null,
      guide_access: valori.guida,
      role: valori.admin ? "admin" : "cliente",
    })
    .eq("id", id);

  if (erroreProfilo) {
    // Senza profilo completo meglio non lasciare un account a metà.
    console.error("Aggiornamento profilo del nuovo utente non riuscito", erroreProfilo);
    await client.auth.admin.deleteUser(id);
    return { errori: {}, valori, erroreGenerale: "Creazione non riuscita. Riprova." };
  }

  revalidatePath(PERCORSO);

  let avviso: string | undefined;
  if (valori.invia) {
    try {
      const urlAccesso = await generaLinkAccesso(valori.email);
      await inviaEmail({
        a: valori.email,
        oggetto: "Il tuo account è pronto",
        email: createElement(EmailAccountCreato, {
          urlAccesso,
          nome: valori.nome || null,
          guidaAttiva: valori.guida,
        }),
      });
    } catch (errore) {
      console.error("Invio email al nuovo utente non riuscito", errore);
      avviso =
        "Account creato, ma l'email non è partita: l'utente può accedere da /accesso con la sua email.";
    }
  }

  return { errori: {}, valori, creato: { email: valori.email, avviso } };
}
