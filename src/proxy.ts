import type { NextRequest } from "next/server";

import { aggiornaSessione } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return aggiornaSessione(request);
}

export const config = {
  matcher: [
    // Tutte le pagine, esclusi asset statici, immagini, route di autenticazione
    // (che gestiscono la sessione da sole), webhook (chiamati da Stripe, senza sessione)
    // e conteggio anonimo delle visite alle landing.
    "/((?!_next/static|_next/image|favicon.ico|auth/|api/webhooks/|api/landing/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
