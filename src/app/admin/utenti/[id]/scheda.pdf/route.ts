import { NextResponse } from "next/server";

import { richiediAdmin } from "@/lib/auth/admin";
import { leggiProfiloCliente } from "@/lib/profilo/dati";
import { generaSchedaPdf } from "@/lib/profilo/scheda-pdf";
import { creaClientServer } from "@/lib/supabase/server";

/** Scheda cliente in PDF per Guido (solo admin). */
export async function GET(_request: Request, { params }: RouteContext<"/admin/utenti/[id]/scheda.pdf">) {
  await richiediAdmin();
  const { id } = await params;
  const dati = await leggiProfiloCliente(id);
  if (!dati) return new NextResponse("Cliente non trovato", { status: 404 });

  const supabase = await creaClientServer();
  const { data: acquisti } = await supabase
    .from("purchases").select("product, status, amount_total, paid_at").eq("user_id", id).neq("status", "in_attesa").order("created_at");

  try {
    const pdf = await generaSchedaPdf({ ...dati, acquisti: acquisti ?? [] });
    const nome = [dati.profilo.first_name, dati.profilo.last_name].filter(Boolean).join("-") || "cliente";
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="scheda-${nome.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (errore) {
    console.error("Generazione della scheda cliente non riuscita", errore);
    return new NextResponse("Generazione del PDF non riuscita", { status: 500 });
  }
}
