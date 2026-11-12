import "server-only";

import { PERCORSO_CONFERMA } from "@/lib/auth/percorsi";
import { creaClientAdmin } from "@/lib/supabase/admin";
import { urlApp } from "@/lib/url";

/**
 * Link di accesso personale (Magic Link) generato lato server, senza che
 * Supabase invii email: lo usa l'app nelle proprie email o per far entrare
 * subito chi ha appena acquistato. Vale per un solo accesso e scade secondo
 * le impostazioni di Supabase Auth (di solito 1 ora).
 */
export async function generaLinkAccesso(email: string, prossimo = "/dashboard") {
  const { data, error } = await creaClientAdmin().auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error || !data.properties?.hashed_token) throw error ?? new Error("Link di accesso mancante");

  const url = new URL(PERCORSO_CONFERMA, urlApp());
  url.searchParams.set("token_hash", data.properties.hashed_token);
  url.searchParams.set("type", "email");
  url.searchParams.set("next", prossimo);
  return url.toString();
}
