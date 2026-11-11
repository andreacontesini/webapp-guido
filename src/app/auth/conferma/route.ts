import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { PERCORSO_ACCESSO, percorsoSicuro } from "@/lib/auth/percorsi";
import { creaClientServer } from "@/lib/supabase/server";

/**
 * Destinazione del Magic Link.
 * - `token_hash` + `type`: template email personalizzato (consigliato),
 *   funziona anche se il link si apre su un altro dispositivo o browser.
 * - `code`: template predefinito di Supabase (flusso PKCE), funziona solo
 *   nello stesso browser in cui è stato chiesto il link.
 *
 * Dopo il login la nuova sessione diventa l'unica valida: le altre vengono
 * revocate e quelle ancora aperte vengono chiuse dal proxy.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const codice = searchParams.get("code");
  const prossimo = percorsoSicuro(searchParams.get("next"));

  const supabase = await creaClientServer();

  let errore: unknown = null;
  if (tokenHash && tipo) {
    ({ error: errore } = await supabase.auth.verifyOtp({
      type: tipo,
      token_hash: tokenHash,
    }));
  } else if (codice) {
    ({ error: errore } = await supabase.auth.exchangeCodeForSession(codice));
  } else {
    errore = new Error("Parametri mancanti");
  }

  if (errore) {
    const destinazione = new URL(PERCORSO_ACCESSO, request.url);
    destinazione.searchParams.set("motivo", "link-non-valido");
    return NextResponse.redirect(destinazione);
  }

  // Sessione unica: registra questa e revoca le altre.
  const { error: erroreSessione } = await supabase.rpc(
    "registra_sessione_corrente",
  );
  if (erroreSessione) {
    console.error("Registrazione sessione non riuscita", erroreSessione);
  }
  await supabase.auth.signOut({ scope: "others" });

  // Il proxy porterà a /benvenuto chi deve ancora completare il profilo.
  return NextResponse.redirect(new URL(prossimo, request.url));
}
