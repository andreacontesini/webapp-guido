import type { Metadata } from "next";
import { BookOpenIcon, LockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "La tua area",
};

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <header className="max-w-[34rem] space-y-3">
        <h1 className="titolo-pagina">
          Benvenuto nella tua area
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Qui trovi i materiali per vendere casa da privato, un passo alla
          volta e senza intermediari.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Sezione principale: la guida è il contenuto disponibile in beta. */}
        <section
          aria-labelledby="titolo-guida"
          className="flex flex-col rounded-xl bg-card p-6 shadow-[0_1px_2px_rgba(15,30,51,0.05)] ring-1 ring-border sm:p-8"
        >
          <span className="mb-6 inline-flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <BookOpenIcon className="size-5" aria-hidden />
          </span>
          <h2
            id="titolo-guida"
            className="titolo-sezione"
          >
            La tua guida
          </h2>
          <p className="mt-2 max-w-[42ch] leading-relaxed text-muted-foreground">
            Tutte le fasi della vendita, dalla valutazione dell&apos;immobile
            al rogito. Puoi leggerla qui, da qualsiasi dispositivo.
          </p>
          <div className="mt-8">
            <Button size="lg" disabled className="h-11 px-5 text-[0.9375rem]">
              Apri la guida
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              La lettura in app sarà attiva a breve.
            </p>
          </div>
        </section>

        {/* Sezione secondaria: bloccata fino all'uscita del videocorso. */}
        <section
          aria-labelledby="titolo-videocorso"
          className="flex flex-col rounded-xl border border-dashed border-border bg-muted p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <LockIcon className="size-5" aria-hidden />
            </span>
            <Badge variant="outline">Presto disponibile</Badge>
          </div>
          <h2
            id="titolo-videocorso"
            className="titolo-sezione text-foreground/75"
          >
            Il tuo videocorso
          </h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Lezioni video su ogni fase della vendita, con modelli e documenti
            da scaricare.
          </p>
        </section>
      </div>
    </div>
  );
}
