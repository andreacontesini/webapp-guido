import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLinkIcon, FileTextIcon } from "lucide-react";

import { CaricamentoPdf } from "@/app/admin/guida/caricamento-pdf";
import { ModuloDettagli } from "@/app/admin/guida/modulo-dettagli";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { richiediAdmin } from "@/lib/auth/admin";
import { creaClientServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Guida PDF",
};

const formatoDataOra = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Rome",
});

const riquadro = "rounded-xl border bg-card p-6 text-card-foreground";

export default function PaginaAdminGuida() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Guida PDF</h1>
        <p className="text-muted-foreground">
          Carica il file della guida e aggiorna i dettagli mostrati agli utenti.
        </p>
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento…</p>}>
        <ContenutoAdminGuida />
      </Suspense>
    </div>
  );
}

async function ContenutoAdminGuida() {
  await richiediAdmin();
  const supabase = await creaClientServer();
  const { data: impostazioni, error } = await supabase
    .from("guide_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !impostazioni) {
    console.error("Lettura impostazioni guida non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a leggere le impostazioni della guida.</p>;
  }

  const haFile = Boolean(impostazioni.file_path);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-labelledby="titolo-file" className={`${riquadro} space-y-6`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <FileTextIcon className="size-5" aria-hidden />
            </span>
            <div>
              <h2 id="titolo-file" className="font-semibold">
                File della guida
              </h2>
              <p className="text-sm text-muted-foreground">
                Aggiornato il {formatoDataOra.format(new Date(impostazioni.updated_at))}
              </p>
            </div>
          </div>
          {haFile ? <Badge>Pubblicata</Badge> : <Badge variant="outline">Nessun file</Badge>}
        </div>

        {haFile && (
          <Button
            variant="outline"
            render={<Link href="/dashboard/guida" target="_blank" />}
            nativeButton={false}
          >
            <ExternalLinkIcon aria-hidden />
            Apri come la vedono gli utenti
          </Button>
        )}

        <CaricamentoPdf haGiaUnFile={haFile} />
      </section>

      <section aria-labelledby="titolo-dettagli" className={`${riquadro} space-y-5`}>
        <div>
          <h2 id="titolo-dettagli" className="font-semibold">
            Dettagli
          </h2>
          <p className="text-sm text-muted-foreground">
            Compaiono sopra il lettore nella pagina della guida.
          </p>
        </div>
        <ModuloDettagli
          valoriIniziali={{
            titolo: impostazioni.title,
            descrizione: impostazioni.description ?? "",
            versione: impostazioni.version ?? "",
          }}
        />
      </section>
    </div>
  );
}
