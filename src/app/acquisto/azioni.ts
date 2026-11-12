"use server";

import { redirect } from "next/navigation";

import { verificaSessioneOspite } from "@/lib/acquisti";
import { generaLinkAccesso } from "@/lib/auth/link-accesso";
import { prodotti } from "@/lib/prodotti";

/**
 * "Entra nella tua area" dalla pagina di conferma: ripete la verifica della
 * sessione con Stripe e, solo se l'account è nato da questo acquisto, genera
 * un link di accesso e lo apre subito. Il primo accesso passa da /benvenuto
 * (privacy e dati), poi porta alla guida.
 */
export async function entraDopoAcquisto(sessionId: string) {
  const verifica = await verificaSessioneOspite(sessionId);
  if (verifica.esito !== "pagato" || !verifica.accessoImmediato) {
    redirect(`/acquisto/conferma?session_id=${encodeURIComponent(sessionId)}`);
  }
  redirect(await generaLinkAccesso(verifica.email, prodotti.guida.href));
}
