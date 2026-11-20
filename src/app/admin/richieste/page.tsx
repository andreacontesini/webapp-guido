import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { AzioniRichiesta } from "@/app/admin/richieste/azioni-richiesta";
import { Badge } from "@/components/ui/badge";
import { richiediAdmin } from "@/lib/auth/admin";
import { creaClientServer } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Richieste",
};

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

export default function PaginaRichieste({ searchParams }: PageProps<"/admin/richieste">) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Richieste</h1>
        <p className="max-w-2xl text-muted-foreground">
          I messaggi arrivati dai moduli di contatto delle landing. Chi li riceve via email si sceglie in Notifiche
          (evento «Richieste landing») e nel blocco del modulo.
        </p>
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento richieste…</p>}>
        <Elenco searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Elenco({ searchParams }: Pick<PageProps<"/admin/richieste">, "searchParams">) {
  await richiediAdmin();
  const { tutte } = await searchParams;
  const mostraTutte = tutte === "1";

  const supabase = await creaClientServer();
  let query = supabase.from("landing_requests").select("*").order("created_at", { ascending: false }).limit(300);
  if (!mostraTutte) query = query.is("handled_at", null);
  const { data: richieste, error } = await query;

  if (error) {
    console.error("Lettura delle richieste non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a caricare le richieste.</p>;
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Filtro richieste" className="flex gap-2 text-sm">
        {[
          { href: "/admin/richieste", etichetta: "Da gestire", attivo: !mostraTutte },
          { href: "/admin/richieste?tutte=1", etichetta: "Tutte", attivo: mostraTutte },
        ].map((f) => (
          <Link
            key={f.href}
            href={f.href}
            aria-current={f.attivo ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5",
              f.attivo ? "border-primary bg-primary/10 font-medium text-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {f.etichetta}
          </Link>
        ))}
      </nav>

      {richieste.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          {mostraTutte ? "Nessuna richiesta ricevuta finora." : "Nessuna richiesta da gestire."}
        </p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {richieste.map((r) => {
            const nome = r.full_name || r.email || r.phone || "Senza nome";
            const gestita = r.handled_at !== null;
            return (
              <li
                key={r.id}
                className={cn("space-y-3 rounded-xl border bg-card p-5 text-card-foreground", !gestita && "border-primary/30")}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatoData.format(new Date(r.created_at))} · {r.landing_title}
                    </p>
                  </div>
                  {gestita ? (
                    <Badge variant="secondary">Gestita</Badge>
                  ) : (
                    <Badge>Da gestire</Badge>
                  )}
                </div>
                <ul className="space-y-1 text-sm">
                  {r.phone && (
                    <li className="flex items-center gap-2">
                      <PhoneIcon className="size-4 text-muted-foreground" aria-hidden />
                      <a href={`tel:${r.phone.replace(/[^+\d]/g, "")}`} className="underline-offset-4 hover:underline">
                        {r.phone}
                      </a>
                    </li>
                  )}
                  {r.email && (
                    <li className="flex items-center gap-2">
                      <MailIcon className="size-4 text-muted-foreground" aria-hidden />
                      <a href={`mailto:${r.email}`} className="break-all underline-offset-4 hover:underline">
                        {r.email}
                      </a>
                    </li>
                  )}
                  {r.city && (
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <MapPinIcon className="size-4" aria-hidden />
                      {r.city}
                    </li>
                  )}
                </ul>
                {r.message && (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-line text-pretty">{r.message}</p>
                )}
                <AzioniRichiesta id={r.id} nome={nome} gestita={gestita} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
