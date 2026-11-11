import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { PERCORSO_INIZIALE } from "@/lib/auth/percorsi";
import { leggiProfiloCorrente } from "@/lib/auth/utente";

/**
 * Profilo dell'admin corrente. Chi non è admin torna alla propria area.
 * Va chiamata in ogni pagina e Server Action del back office, anche se il
 * proxy blocca già `/admin`: le Server Action si possono invocare da qualsiasi
 * pagina, quindi il controllo deve stare anche lì.
 */
export const richiediAdmin = cache(async () => {
  const profilo = await leggiProfiloCorrente();
  if (profilo.role !== "admin") redirect(PERCORSO_INIZIALE);
  return profilo;
});
