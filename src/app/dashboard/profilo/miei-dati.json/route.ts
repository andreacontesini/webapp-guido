import { NextResponse } from "next/server";

import { notificaDopo } from "@/lib/notifiche/invia";
import { datiEsportati } from "@/lib/profilo/account";
import { leggiProfiloCompleto } from "@/lib/profilo/dati";
import { creaClientServer } from "@/lib/supabase/server";

/**
 * "Scarica i tuoi dati" (GDPR art. 15 e 20): file JSON con account, immobile
 * e acquisti dell'utente collegato. Nessun id dal browser: si legge solo la
 * sessione, e la RLS limita comunque ai propri dati.
 */
export async function GET() {
  const { profilo, immobile } = await leggiProfiloCompleto();
  const supabase = await creaClientServer();
  const { data: acquisti } = await supabase
    .from("purchases")
    .select("product, status, amount_total, currency, paid_at, created_at")
    .eq("user_id", profilo.id)
    .order("created_at");

  const dati = datiEsportati(profilo, immobile, acquisti ?? []);
  notificaDopo({
    evento: "richiesta_gdpr",
    cliente: {
      id: profilo.id,
      email: profilo.email,
      nome: [profilo.first_name, profilo.last_name].filter(Boolean).join(" ") || null,
    },
    tipo: "scaricamento",
    il: new Date().toISOString(),
  });
  return new NextResponse(JSON.stringify(dati, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="i-miei-dati-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
