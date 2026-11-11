import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { SfondoHero } from "@/components/layout/sfondo-hero";
import { Button } from "@/components/ui/button";
import { PERCORSO_ACCESSO } from "@/lib/auth/percorsi";
import { EMAIL_ASSISTENZA } from "@/lib/prodotti";

export const metadata: Metadata = {
  title: "Pagina non trovata",
};

/** Pagina 404, con lo stile della pagina iniziale. */
export default function PaginaNonTrovata() {
  return (
    <main className="relative isolate flex flex-1 items-center overflow-hidden">
      <SfondoHero />

      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-16 text-center sm:px-6 lg:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 py-1 pr-3 pl-1 text-sm text-muted-foreground backdrop-blur">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            404
          </span>
          Pagina non trovata
        </p>

        <div className="space-y-5">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Questa pagina <span className="text-primary">non esiste</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-pretty text-muted-foreground">
            L&apos;indirizzo potrebbe essere sbagliato oppure la pagina è stata spostata.
            Riparti dalla pagina iniziale o entra nella tua area riservata.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/" />} nativeButton={false}>
            <ArrowLeftIcon aria-hidden />
            Torna alla pagina iniziale
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href={PERCORSO_ACCESSO} />}
            nativeButton={false}
          >
            Accedi alla tua area
            <ArrowRightIcon aria-hidden />
          </Button>
        </div>

        <p className="border-t pt-8 text-sm text-muted-foreground">
          Pensi che sia un errore? Scrivici a{" "}
          <a
            href={`mailto:${EMAIL_ASSISTENZA}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {EMAIL_ASSISTENZA}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
