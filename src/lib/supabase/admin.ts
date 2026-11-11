import "server-only";

import { createClient } from "@supabase/supabase-js";

import { configSupabase } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/tipi";

/**
 * Client con la service role: ignora la RLS. Solo lato server, e solo dopo
 * aver verificato i permessi dell'utente (es. lettura del PDF della guida).
 */
export function creaClientAdmin() {
  const { url } = configSupabase();
  const chiave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chiave) {
    throw new Error("Configurazione mancante: imposta SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, chiave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
