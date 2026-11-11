import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { configSupabase } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/tipi";

/**
 * Client Supabase per Server Component, Server Action e Route Handler.
 * Va creato a ogni richiesta (mai condiviso in una variabile globale).
 */
export async function creaClientServer() {
  const cookieStore = await cookies();
  const { url, chiaveAnonima } = configSupabase();

  return createServerClient<Database>(url, chiaveAnonima, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookieDaImpostare) {
        try {
          for (const { name, value, options } of cookieDaImpostare) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chiamato da un Server Component: i cookie non si possono scrivere.
          // Nessun problema, il refresh della sessione lo fa `src/proxy.ts`.
        }
      },
    },
  });
}
