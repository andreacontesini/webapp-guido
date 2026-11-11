import { NextResponse, type NextRequest } from "next/server";

import { BUCKET_GUIDA } from "@/lib/guida";
import { creaClientAdmin } from "@/lib/supabase/admin";
import { creaClientServer } from "@/lib/supabase/server";

const nonAutorizzato = (status: 401 | 403 | 404, messaggio: string) =>
  NextResponse.json({ errore: messaggio }, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Consegna il PDF della guida al lettore in-app.
 * Il bucket è privato: il file passa solo da qui, dopo aver verificato
 * sessione valida, account non bloccato e permesso `guide_access`.
 */
export async function GET(request: NextRequest) {
  // Aperto direttamente nel browser (es. URL incollato): rimanda al lettore.
  if (request.headers.get("sec-fetch-dest") === "document") {
    return NextResponse.redirect(new URL("/dashboard/guida", request.url));
  }

  const supabase = await creaClientServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return nonAutorizzato(401, "Accesso richiesto");

  const { data: profilo } = await supabase
    .from("profiles")
    .select("is_blocked, guide_access, current_session_id")
    .eq("id", claims.sub)
    .maybeSingle();

  if (
    !profilo ||
    profilo.is_blocked ||
    !profilo.guide_access ||
    (profilo.current_session_id && profilo.current_session_id !== claims.session_id)
  ) {
    return nonAutorizzato(403, "Non hai accesso alla guida");
  }

  const { data: impostazioni } = await supabase
    .from("guide_settings")
    .select("file_path")
    .eq("id", 1)
    .maybeSingle();
  if (!impostazioni?.file_path) return nonAutorizzato(404, "Guida non ancora disponibile");

  const { data: file, error } = await creaClientAdmin()
    .storage.from(BUCKET_GUIDA)
    .download(impostazioni.file_path);
  if (error || !file) {
    console.error("Download guida non riuscito", error);
    return nonAutorizzato(404, "Guida non disponibile");
  }

  return new NextResponse(file.stream(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(file.size),
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
