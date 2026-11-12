import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLinkIcon, EyeIcon, HomeIcon, PencilIcon } from "lucide-react";

import { AzioniLanding, GestioneLanding } from "@/app/admin/landing/azioni-landing";
import { NuovaLanding } from "@/app/admin/landing/nuova-landing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { richiediAdmin } from "@/lib/auth/admin";
import { isBloccoValido } from "@/lib/landing/blocchi";
import { creaClientServer } from "@/lib/supabase/server";
import { urlLanding } from "@/lib/url";

export const metadata: Metadata = {
  title: "Landing",
};

/** Periodo delle statistiche di conversione. */
const GIORNI_STATISTICHE = 30;

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const percentuale = (parte: number, totale: number) =>
  totale > 0
    ? new Intl.NumberFormat("it-IT", { style: "percent", maximumFractionDigits: 1 }).format(parte / totale)
    : "—";

export default function PaginaAdminLanding() {
  const base = urlLanding();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Landing</h1>
          <p className="text-muted-foreground">
            Pagine di vendita pubbliche: crea, modifica, pubblica e scegli quale mostrare come
            pagina iniziale.
          </p>
        </div>
        <NuovaLanding base={base} />
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento landing…</p>}>
        <ElencoLanding base={base} />
      </Suspense>
    </div>
  );
}

async function ElencoLanding({ base }: { base: string }) {
  await richiediAdmin();

  // La RLS consente agli admin di leggere anche le bozze.
  const supabase = await creaClientServer();
  const [{ data: landing, error }, { data: statistiche }] = await Promise.all([
    supabase
      .from("landing_pages")
      .select("id, slug, title, status, is_home, blocks, updated_at")
      .order("created_at", { ascending: true }),
    supabase.rpc("statistiche_landing", { giorni: GIORNI_STATISTICHE }),
  ]);

  if (error) {
    console.error("Lettura landing non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a caricare le landing.</p>;
  }
  if (!landing.length) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-muted-foreground">
        Nessuna landing: creane una con «Nuova landing».
      </p>
    );
  }

  const perLanding = new Map((statistiche ?? []).map((s) => [s.landing_id, s]));
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
          const blocchi = Array.isArray(l.blocks) ? l.blocks : [];
          const incompleti = blocchi.filter((b) => !isBloccoValido(b)).length;
          const indirizzo = l.is_home ? `${base}/` : `${base}/${l.slug}`;
          const s = perLanding.get(l.id);
          const visite = Number(s?.visite ?? 0);
          const checkout = Number(s?.checkout ?? 0);
          const acquisti = Number(s?.acquisti ?? 0);

          return (
            <li key={l.id} className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">
                      <Link href={`/admin/landing/modifica?id=${l.id}`} className="hover:underline">
                        {l.title}
                      </Link>
                    </h2>
                    <Badge variant={pubblicata ? "default" : "secondary"}>
                      {pubblicata ? "Pubblicata" : "Bozza"}
                    </Badge>
                    {l.is_home && <Badge variant="outline">Pagina iniziale</Badge>}
                  </div>
                  {pubblicata ? (
                    <a
                      href={l.is_home ? "/" : `/${l.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm break-all text-primary underline-offset-4 hover:underline"
                    >
                      {indirizzo}
                      <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    <p className="text-sm break-all text-muted-foreground">/{l.slug}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {blocchi.length} blocchi
                    {incompleti > 0 && ` (${incompleti} incompleti)`} · aggiornata il{" "}
                    {formatoData.format(new Date(l.updated_at))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" render={<Link href={`/admin/landing/modifica?id=${l.id}`} />} nativeButton={false}>
                    <PencilIcon aria-hidden />
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<a href={`/anteprima/${l.id}`} target="_blank" rel="noreferrer" />}
                    nativeButton={false}
                  >
                    <EyeIcon aria-hidden />
                    Anteprima
                  </Button>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { etichetta: "Visite", valore: visite.toLocaleString("it-IT") },
                  { etichetta: "Checkout avviati", valore: checkout.toLocaleString("it-IT") },
                  { etichetta: "Acquisti", valore: acquisti.toLocaleString("it-IT") },
                  { etichetta: "Conversione", valore: percentuale(acquisti, visite) },
                ].map(({ etichetta, valore }) => (
                  <div key={etichetta} className="rounded-lg border px-3 py-2">
                    <dt className="text-xs text-muted-foreground">{etichetta}</dt>
                    <dd className="text-lg font-semibold tabular-nums">{valore}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap items-start justify-between gap-3 border-t pt-4">
                <AzioniLanding id={l.id} pubblicata={pubblicata} paginaIniziale={l.is_home} />
                <GestioneLanding id={l.id} titolo={l.title} paginaIniziale={l.is_home} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Statistiche degli ultimi {GIORNI_STATISTICHE} giorni, anonime e senza cookie: visite alla
        pagina, pagamenti avviati su Stripe e acquisti completati partiti dalla landing.
      </p>
    </div>
  );
}
