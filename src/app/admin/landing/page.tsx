import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLinkIcon, HomeIcon } from "lucide-react";

import { AzioniLanding } from "@/app/admin/landing/azioni-landing";
import { Badge } from "@/components/ui/badge";
import { richiediAdmin } from "@/lib/auth/admin";
import { normalizzaBlocchi, NOMI_BLOCCHI } from "@/lib/landing/blocchi";
import { creaClientServer } from "@/lib/supabase/server";
import { urlLanding } from "@/lib/url";

export const metadata: Metadata = {
  title: "Landing",
};

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function PaginaAdminLanding() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Landing</h1>
        <p className="text-muted-foreground">
          Pagine di vendita pubbliche della guida: pubblicale o ritirale e scegli quale
          mostrare come pagina iniziale. L&apos;editor dei contenuti arriverà con la Fase 9.
        </p>
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento landing…</p>}>
        <ElencoLanding />
      </Suspense>
    </div>
  );
}

async function ElencoLanding() {
  await richiediAdmin();

  // La RLS consente agli admin di leggere anche le bozze.
  const supabase = await creaClientServer();
  const { data: landing, error } = await supabase
    .from("landing_pages")
    .select("id, slug, title, status, is_home, blocks, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Lettura landing non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a caricare le landing.</p>;
  }
  if (!landing.length) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-muted-foreground">
        Nessuna landing. Con la Fase 9 potrai crearle da qui.
      </p>
    );
  }

  const base = urlLanding();
  const nessunaIniziale = !landing.some((l) => l.is_home);

  return (
    <div className="space-y-4">
      {nessunaIniziale && (
        <p className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <HomeIcon className="size-4 shrink-0" aria-hidden />
          La pagina iniziale ({base}/) mostra la presentazione predefinita con
          l&apos;invito all&apos;accesso.
        </p>
      )}

      <ul className="space-y-3">
        {landing.map((l) => {
          const pubblicata = l.status === "pubblicata";
          const blocchi = normalizzaBlocchi(l.blocks);
          const indirizzo = l.is_home ? `${base}/` : `${base}/${l.slug}`;
          return (
            <li key={l.id} className="rounded-xl border bg-card p-5 text-card-foreground">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{l.title}</h2>
                    <Badge variant={pubblicata ? "default" : "secondary"}>
                      {pubblicata ? "Pubblicata" : "Bozza"}
                    </Badge>
                    {l.is_home && <Badge variant="outline">Pagina iniziale</Badge>}
                  </div>
                  {pubblicata ? (
                    <Link
                      href={l.is_home ? "/" : `/${l.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-sm break-all text-primary underline-offset-4 hover:underline"
                    >
                      {indirizzo}
                      <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden />
                    </Link>
                  ) : (
                    <p className="text-sm break-all text-muted-foreground">/{l.slug}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {blocchi.length} blocchi: {blocchi.map((b) => NOMI_BLOCCHI[b.tipo]).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aggiornata il {formatoData.format(new Date(l.updated_at))}
                  </p>
                </div>
                <AzioniLanding id={l.id} pubblicata={pubblicata} paginaIniziale={l.is_home} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
