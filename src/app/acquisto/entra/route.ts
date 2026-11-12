import { NextResponse, type NextRequest } from "next/server";

import { verificaSessioneOspite } from "@/lib/acquisti";
import { generaLinkAccesso } from "@/lib/auth/link-accesso";
import { PERCORSO_INIZIALE } from "@/lib/auth/percorsi";

/**
 * Ritorno da Stripe Checkout per chi acquista senza account (`success_url`).
 * Verifica il pagamento con Stripe e registra l'acquisto, poi:
 * - account nato da questo acquisto: entra subito con un link di accesso
 *   generato al volo; il primo accesso passa da /benvenuto (dati base e
 *   privacy), poi alla dashboard;
 * - account già esistente (o verifica non riuscita): pagina di conferma, che
 *   rimanda al link inviato via email. Su Stripe l'email si digita senza
 *   verifica, quindi pagando non si deve poter entrare in un account altrui.
 *
 * È una route e non un'azione server: il link di accesso vale una sola volta e
 * va aperto con una navigazione vera del browser.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id") ?? "";
  const conferma = new URL("/acquisto/conferma", request.url);
  conferma.searchParams.set("session_id", sessionId);

  try {
    const verifica = await verificaSessioneOspite(sessionId);
    if (verifica.esito === "pagato" && verifica.accessoImmediato) {
      return NextResponse.redirect(await generaLinkAccesso(verifica.email, PERCORSO_INIZIALE));
    }
  } catch (errore) {
    console.error("Accesso dopo l'acquisto non riuscito", errore);
  }
  return NextResponse.redirect(conferma);
}
