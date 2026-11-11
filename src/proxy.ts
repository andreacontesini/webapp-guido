import type { NextRequest } from "next/server";

import { aggiornaSessione } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return aggiornaSessione(request);
}

export const config = {
  matcher: [
    // Tutte le pagine, esclusi asset statici, immagini e route di autenticazione
    // (che gestiscono la sessione da sole).
    "/((?!_next/static|_next/image|favicon.ico|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
