import type { Metadata } from "next";
import { BookOpenIcon, LockIcon, PlayCircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "La tua area",
};

/** Stile comune dei riquadri della griglia. */
const riquadro = "rounded-xl border bg-card p-6 text-card-foreground";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Bentornato
        </h1>
        <p className="text-muted-foreground">
          Qui trovi i materiali per vendere casa da privato, un passo alla
          volta.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Riquadro principale: la guida, disponibile in beta. */}
        <section
          aria-labelledby="titolo-guida"
          className={`${riquadro} relative flex flex-col overflow-hidden sm:p-8 lg:col-span-2 lg:row-span-2`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl"
          />
          <span className="mb-6 inline-flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <BookOpenIcon className="size-6" aria-hidden />
          </span>
          <h2 id="titolo-guida" className="text-xl font-semibold">
            La tua guida
          </h2>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Tutte le fasi della vendita, dalla valutazione dell&apos;immobile
            al rogito. Puoi leggerla qui, da qualsiasi dispositivo.
          </p>
          <div className="mt-auto pt-10">
            <Button size="lg" disabled>
              Apri la guida
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              La lettura in app sarà attiva a breve.
            </p>
          </div>
        </section>

        {/* Videocorso: bloccato fino all'uscita. */}
        <section aria-labelledby="titolo-videocorso" className={riquadro}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <LockIcon className="size-5" aria-hidden />
            </span>
            <Badge variant="outline">Presto disponibile</Badge>
          </div>
          <h2 id="titolo-videocorso" className="font-semibold">
            Il tuo videocorso
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lezioni video su ogni fase della vendita, con modelli e documenti
            da scaricare.
          </p>
        </section>

        {/* Stato dei contenuti a cui l'utente ha accesso. */}
        <section aria-labelledby="titolo-accesso" className={riquadro}>
          <h2 id="titolo-accesso" className="font-semibold">
            Il tuo accesso
          </h2>
          <ul className="mt-4 divide-y">
            <li className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <span className="flex items-center gap-2 text-sm">
                <BookOpenIcon className="size-4 text-muted-foreground" aria-hidden />
                Guida PDF
              </span>
              <Badge>Attiva</Badge>
            </li>
            <li className="flex items-center justify-between gap-3 py-3 last:pb-0">
              <span className="flex items-center gap-2 text-sm">
                <PlayCircleIcon className="size-4 text-muted-foreground" aria-hidden />
                Videocorso
              </span>
              <Badge variant="secondary">In arrivo</Badge>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
