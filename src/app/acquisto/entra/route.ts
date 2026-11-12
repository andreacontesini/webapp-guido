import { NextResponse, type NextRequest } from "next/server";

import { verificaSessioneOspite } from "@/lib/acquisti";
import { generaLinkAccesso } from "@/lib/auth/link-accesso";
import { prodotti } from "@/lib/prodotti";

/**
 * "Entra e leggi la guida" dalla pagina di conferma (modulo POST): ripete la
 * verifica della sessione con Stripe e, solo se l'account è nato da questo
 * acquisto, genera un link di accesso e ci porta il browser. Il primo accesso
 * passa da /benvenuto (privacy e dati), poi alla guida.
 *
 * È una route e non un'azione server: il link di accesso vale una sola volta e
 * va aperto con una navigazione vera del browser. Con il redirect di
 * un'azione server il router di Next può richiederlo due volte, e la seconda
 * richiesta lo trova già usato e manda alla pagina di accesso.
 */
export async function POST(request: NextRequest) {
  const dati = await request.formData();
  const sessionId = String(dati.get("session_id") ?? "");

  const verifica = await verificaSessioneOspite(sessionId);
  if (verifica.esito !== "pagato" || !verifica.accessoImmediato) {
    const conferma = new URL("/acquisto/conferma", request.url);
    conferma.searchParams.set("session_id", sessionId);
    return NextResponse.redirect(conferma, 303);
  }

  // 303: il browser segue il redirect con una GET.
  return NextResponse.redirect(await generaLinkAccesso(verifica.email, prodotti.guida.href), 303);
}
