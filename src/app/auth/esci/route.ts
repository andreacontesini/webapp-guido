import { NextResponse, type NextRequest } from "next/server";

import { PERCORSO_ACCESSO, isMotivoUscita } from "@/lib/auth/percorsi";
import { creaClientServer } from "@/lib/supabase/server";

/**
 * Chiude la sessione su questo dispositivo e torna alla pagina di accesso.
 * - POST: pulsante "Esci".
 * - GET con `motivo`: uscita forzata dal proxy (account bloccato, accesso da
 *   un altro dispositivo...). Lo scope è `local` per non chiudere la sessione
 *   valida aperta altrove.
 */
async function esci(request: NextRequest) {
  const supabase = await creaClientServer();
  await supabase.auth.signOut({ scope: "local" });

  const destinazione = new URL(PERCORSO_ACCESSO, request.url);
  const motivo = request.nextUrl.searchParams.get("motivo");
  if (isMotivoUscita(motivo)) {
    destinazione.searchParams.set("motivo", motivo);
  }
  // 303: dopo un POST il browser segue il redirect con una GET.
  return NextResponse.redirect(destinazione, { status: 303 });
}

export { esci as GET, esci as POST };
