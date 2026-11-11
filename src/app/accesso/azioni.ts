"use server";

import { headers } from "next/headers";

import { PERCORSO_CONFERMA, percorsoSicuro } from "@/lib/auth/percorsi";
import { creaClientServer } from "@/lib/supabase/server";

export type StatoAccesso =
  | { esito: "iniziale" }
  | { esito: "inviato"; email: string }
  | { esito: "errore"; messaggio: string; email: string };

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** URL pubblico dell'app, usato nel link dell'email. */
async function urlApp() {
  const daAmbiente = process.env.NEXT_PUBLIC_APP_URL;
  if (daAmbiente) return daAmbiente.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocollo = h.get("x-forwarded-proto") ?? "https";
  return `${protocollo}://${host}`;
}

/** Invia il Magic Link: accede chi ha già un account, si registra chi è nuovo. */
export async function inviaMagicLink(
  _statoPrecedente: StatoAccesso,
  formData: FormData,
): Promise<StatoAccesso> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const prossimo = percorsoSicuro(String(formData.get("next") ?? ""));

  if (!formatoEmail.test(email)) {
    return { esito: "errore", messaggio: "Inserisci un indirizzo email valido.", email };
  }

  const supabase = await creaClientServer();
  const redirect = new URL(PERCORSO_CONFERMA, await urlApp());
  redirect.searchParams.set("next", prossimo);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirect.toString(),
    },
  });

  if (error) {
    console.error("Invio Magic Link non riuscito", error);
    const troppeRichieste = error.status === 429;
    return {
      esito: "errore",
      email,
      messaggio: troppeRichieste
        ? "Hai richiesto troppi link in poco tempo. Attendi qualche minuto e riprova."
        : "Non siamo riusciti a inviare l'email. Riprova tra poco.",
    };
  }

  return { esito: "inviato", email };
}
