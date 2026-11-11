import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon, BookOpenIcon, ClockIcon, LockIcon } from "lucide-react";

import { LettorePdf } from "@/components/guida/lettore-pdf";
import { Button } from "@/components/ui/button";
import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { leggiStatoGuida } from "@/lib/guida";

/** Testo della filigrana disegnata su ogni pagina della guida. */
const FILIGRANA = "Guido Contesini - Mediatore immobiliare";

export const metadata: Metadata = {
  title: "La tua guida",
};

export default function PaginaGuida() {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        render={<Link href="/dashboard" />}
        nativeButton={false}
      >
        <ArrowLeftIcon aria-hidden />
        La tua area
      </Button>
      <Suspense fallback={<Avviso icona={BookOpenIcon} titolo="La tua guida" testo="Caricamento…" />}>
        <ContenutoGuida />
      </Suspense>
      <p className="hidden print:block">La stampa della guida non è disponibile.</p>
    </div>
  );
}

async function ContenutoGuida() {
  const [stato, profilo] = await Promise.all([leggiStatoGuida(), leggiProfiloCorrente()]);

  if (stato.stato === "non-abilitata") {
    return (
      <Avviso
        icona={LockIcon}
        titolo="La guida non è attiva sul tuo account"
        testo="Se pensi che si tratti di un errore, scrivici e la abilitiamo."
      />
    );
  }

  if (stato.stato === "in-preparazione") {
    return (
      <Avviso
        icona={ClockIcon}
        titolo={stato.impostazioni.title}
        testo="Stiamo preparando la guida: sarà disponibile qui a breve."
      />
    );
  }

  const { title, description, version } = stato.impostazioni;
  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {(description || version) && (
          <p className="text-muted-foreground">
            {description}
            {description && version && " · "}
            {version && `Versione ${version}`}
          </p>
        )}
      </header>
      <LettorePdf
        url="/dashboard/guida/file"
        filigrana={FILIGRANA}
        filigranaDettaglio={profilo.email}
      />
    </>
  );
}

function Avviso({
  icona: Icona,
  titolo,
  testo,
}: {
  icona: typeof BookOpenIcon;
  titolo: string;
  testo: string;
}) {
  return (
    <section className="rounded-xl border bg-card p-6 text-card-foreground sm:p-8">
      <span className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icona className="size-5" aria-hidden />
      </span>
      <h1 className="text-xl font-semibold">{titolo}</h1>
      <p className="mt-1 text-muted-foreground">{testo}</p>
    </section>
  );
}
