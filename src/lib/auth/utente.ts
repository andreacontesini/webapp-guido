import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { PERCORSO_ACCESSO, PERCORSO_ESCI } from "@/lib/auth/percorsi";
import { creaClientServer } from "@/lib/supabase/server";

/**
 * Profilo dell'utente autenticato, letto una sola volta per richiesta.
 * Ripete i controlli del proxy (difesa in profondità): se la sessione non è
 * valida reindirizza, quindi chi lo chiama riceve sempre un profilo.
 */
export const leggiProfiloCorrente = cache(async () => {
  const supabase = await creaClientServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect(PERCORSO_ACCESSO);

  const { data: profilo } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .maybeSingle();

  if (!profilo) redirect(`${PERCORSO_ESCI}?motivo=errore`);
  if (profilo.is_blocked) redirect(`${PERCORSO_ESCI}?motivo=bloccato`);
  if (
    profilo.current_session_id &&
    profilo.current_session_id !== claims.session_id
  ) {
    redirect(`${PERCORSO_ESCI}?motivo=altra-sessione`);
  }

  return profilo;
});
