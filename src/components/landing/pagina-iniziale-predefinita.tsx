import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, LockIcon, PlayCircleIcon } from "lucide-react";

import { SfondoHero } from "@/components/layout/sfondo-hero";
import { Button } from "@/components/ui/button";
import { PERCORSO_ACCESSO } from "@/lib/auth/percorsi";

/** Numeri chiave mostrati sotto il testo (dati reali della guida). */
const punti = [
  { valore: "7", etichetta: "tappe, dai controlli preliminari al rogito" },
  { valore: "18", etichetta: "pagine pratiche, senza giri di parole" },
  { valore: "1", etichetta: "area riservata, da ogni dispositivo" },
];

/**
 * Pagina iniziale mostrata finché in admin non viene scelta una landing come
 * pagina iniziale (vedi `src/app/page.tsx`).
 */
export function PaginaInizialePredefinita() {
  return (
    <main className="relative isolate flex flex-1 items-center overflow-hidden">
      <SfondoHero />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
        <div className="space-y-8 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 py-1 pr-3 pl-1 text-sm text-muted-foreground backdrop-blur">
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Novità
            </span>
            La guida è disponibile online
          </p>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Vendi casa da privato,{" "}
              <span className="text-primary">con sicurezza</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-pretty text-muted-foreground lg:mx-0">
              La guida di Guido Contesini, mediatore immobiliare, ti accompagna in
              ogni passaggio: dalla valutazione dell&apos;immobile alla trattativa,
              fino al rogito dal notaio.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              render={<Link href={PERCORSO_ACCESSO} />}
              nativeButton={false}
            >
              Accedi alla tua area
              <ArrowRightIcon aria-hidden />
            </Button>
            <p className="text-sm text-muted-foreground">Ti basta la tua email, nessuna password.</p>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t pt-8 text-left">
            {punti.map(({ valore, etichetta }) => (
              <div key={etichetta} className="space-y-1">
                <dt className="sr-only">{etichetta}</dt>
                <dd className="text-3xl font-semibold tabular-nums sm:text-4xl">{valore}</dd>
                <dd className="text-xs text-muted-foreground sm:text-sm">{etichetta}</dd>
              </div>
            ))}
          </dl>
        </div>

        <AnteprimaApp />
      </div>
    </main>
  );
}

/** Anteprima illustrativa dell'area riservata (solo decorativa). */
function AnteprimaApp() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/25 via-transparent to-transparent blur-2xl" />

      <div className="rounded-2xl border bg-card/90 p-3 shadow-2xl backdrop-blur">
        {/* Barra della finestra */}
        <div className="flex items-center gap-1.5 px-2 pb-3">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-muted" />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          {/* Riquadro guida con pagina del PDF */}
          <div className="rounded-xl border bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <BookOpenIcon className="size-4" />
              </span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-medium text-primary-foreground">
                Attiva
              </span>
            </div>
            <p className="text-sm font-semibold">Una vendita buona e giusta</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Tappa 3 di 7</p>
            <div className="mt-4 h-1.5 rounded-full bg-muted">
              <div className="h-full w-[42%] rounded-full bg-primary" />
            </div>
            <div className="mt-5 space-y-2">
              {["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3"].map((larghezza, i) => (
                <div key={i} className={`h-2 rounded-full bg-muted ${larghezza}`} />
              ))}
            </div>
          </div>

          {/* Videocorso in arrivo */}
          <div className="flex flex-col rounded-xl border border-dashed bg-background/60 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <PlayCircleIcon className="size-4" />
              </span>
              <LockIcon className="size-3.5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">Videocorso</p>
            <p className="mt-0.5 text-xs text-muted-foreground">In arrivo</p>
            <div className="mt-auto space-y-2 pt-5 opacity-60">
              {["01", "02", "03"].map((n) => (
                <div key={n} className="flex items-center gap-2 rounded-md border border-dashed px-2 py-1.5">
                  <span className="text-[0.65rem] text-muted-foreground tabular-nums">{n}</span>
                  <span className="h-1.5 flex-1 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
