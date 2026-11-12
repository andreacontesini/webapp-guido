import "server-only";

import { cache } from "react";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { creaClientServer } from "@/lib/supabase/server";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

/** Profilo e immobile dell'utente collegato. */
export const leggiProfiloCompleto = cache(async () => {
  const profilo = await leggiProfiloCorrente();
  const supabase = await creaClientServer();
  const { data: immobile } = await supabase.from("properties").select("*").eq("user_id", profilo.id).maybeSingle();
  return { profilo, immobile: immobile ?? null };
});

/** Profilo e immobile di un cliente, per l'admin (la RLS consente la lettura solo agli admin). */
export async function leggiProfiloCliente(userId: string): Promise<{ profilo: Profilo; immobile: Immobile | null } | null> {
  const supabase = await creaClientServer();
  const [{ data: profilo }, { data: immobile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("properties").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  return profilo ? { profilo, immobile: immobile ?? null } : null;
}
