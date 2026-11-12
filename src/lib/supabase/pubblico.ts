import "server-only";

import { createClient } from "@supabase/supabase-js";

import { configSupabase } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/tipi";

/**
 * Client anonimo, senza cookie né sessione: legge solo i dati pubblici
 * consentiti dalla RLS (es. landing pubblicate). Non dipendendo dalla
 * richiesta si può usare dentro le funzioni con `"use cache"`.
 */
export function creaClientPubblico() {
  const { url, chiaveAnonima } = configSupabase();
  return createClient<Database>(url, chiaveAnonima, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
