import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/tipi";

/**
 * Client Supabase per il browser (chiave pubblica, soggetto alla RLS).
 * Usato solo per caricare file su Storage con un URL firmato dal server.
 */
export function creaClientBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
