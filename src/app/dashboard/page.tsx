import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  LockIcon,
  PlayCircleIcon,
  UserRoundPenIcon,
} from "lucide-react";

import { PopupAcquisto } from "@/components/acquisto/popup-acquisto";
import { acquistoDisponibile } from "@/lib/stripe";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { leggiStatoGuida, type StatoGuida } from "@/lib/guida";
import { calcolaCompletamento } from "@/lib/profilo/completamento";
import { leggiProfiloCompleto } from "@/lib/profilo/dati";

export const metadata: Metadata = {
  title: "La tua area",
};

/** Stile comune dei riquadri della griglia. */
const riquadro = "rounded-xl border bg-card p-6 text-card-foreground";

/** Testi della sezione guida in base allo stato del permesso e del file. */
const testiGuida: Record<
  StatoGuida["stato"],
  { badge: string; variante: "default" | "secondary" | "outline"; nota: string }
> = {
  disponibile: {
    badge: "Attiva",
    variante: "default",
    nota: "Puoi leggerla qui, da qualsiasi dispositivo.",
  },
  "in-preparazione": {
    badge: "In arrivo",
    variante: "secondary",
    nota: "Stiamo preparando la guida: sarà disponibile qui a breve.",
  },
  "non-abilitata": {
    badge: "Non acquistata",
    variante: "outline",
    nota: "Dopo l'acquisto la leggi qui, da qualsiasi dispositivo.",
  },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          <Suspense fallback="Bentornato">
            <Saluto />
          </Suspense>
        </h1>
        <p className="text-muted-foreground">
          Qui trovi i materiali per vendere casa da privato, un passo alla
          volta.
        </p>
      </header>

      <Suspense fallback={null}>
        <CompletaProfilo />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* La tua guida: sezione principale, disponibile in beta. */}
        <section
          aria-labelledby="titolo-guida"
          className={`${riquadro} relative flex flex-col overflow-hidden sm:p-8 lg:col-span-2`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <BookOpenIcon className="size-6" aria-hidden />
            </span>
            <Suspense fallback={null}>
              <BadgeGuida />
            </Suspense>
          </div>
          <h2 id="titolo-guida" className="text-xl font-semibold">
            La tua guida
          </h2>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Tutte le fasi della vendita, dalla valutazione dell&apos;immobile
            al rogito.
          </p>
          <div className="mt-auto pt-10">
            <Suspense
              fallback={
                <Button size="lg" disabled>
                  Apri la guida
                </Button>
              }
            >
              <AzioneGuida />
            </Suspense>
          </div>
        </section>

        {/* Il tuo videocorso: bloccato fino all'uscita. */}
        <section
          aria-labelledby="titolo-videocorso"
          className={`${riquadro} relative flex flex-col overflow-hidden`}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <PlayCircleIcon className="size-6" aria-hidden />
            </span>
            <Badge variant="outline" className="gap-1">
              <LockIcon className="size-3" aria-hidden />
              Coming Soon
            </Badge>
          </div>
          <h2 id="titolo-videocorso" className="text-xl font-semibold">
            Il tuo videocorso
          </h2>
          <p className="mt-2 text-muted-foreground">
            Lezioni video su ogni fase della vendita, con modelli e documenti
            da scaricare.
          </p>
          {/* Anteprima delle lezioni, in grigio finché il corso è bloccato. */}
          <ul aria-hidden className="mt-6 space-y-2 opacity-60 blur-[1px]">
            {["Valutare l'immobile", "Preparare la casa e le foto", "Trattativa e rogito"].map(
              (lezione, i) => (
                <li
                  key={lezione}
                  className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground"
                >
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {lezione}
                </li>
              ),
            )}
          </ul>
          <p className="mt-auto pt-6 text-sm text-muted-foreground">
            Ti avviseremo appena sarà disponibile.
          </p>
        </section>
      </div>
    </div>
  );
}

/** Saluto con il nome, letto dal profilo a ogni richiesta. */
async function Saluto() {
  const { first_name } = await leggiProfiloCorrente();
  return first_name ? `Ciao, ${first_name}` : "Bentornato";
}

async function BadgeGuida() {
  const { stato } = await leggiStatoGuida();
  const { badge, variante } = testiGuida[stato];
  return <Badge variant={variante}>{badge}</Badge>;
}

async function AzioneGuida() {
  const { stato } = await leggiStatoGuida();
  const { nota } = testiGuida[stato];
  return (
    <>
      {stato === "disponibile" ? (
        <Button size="lg" render={<Link href="/dashboard/guida" />} nativeButton={false}>
          Apri la guida
          <ArrowRightIcon aria-hidden />
        </Button>
      ) : stato === "non-abilitata" ? (
        <PopupAcquisto prodotto="guida" pagamentoAttivo={acquistoDisponibile("guida")} />
      ) : (
        <Button size="lg" disabled>
          Apri la guida
        </Button>
      )}
      <p className="mt-2 text-sm text-muted-foreground">{nota}</p>
    </>
  );
}

/** Invito a completare il profilo, finché non è al 100%. */
async function CompletaProfilo() {
  const { profilo, immobile } = await leggiProfiloCompleto();
  const { percentuale } = calcolaCompletamento(profilo, immobile);
  if (percentuale >= 100) return null;

  return (
    <section
      aria-labelledby="titolo-completa-profilo"
      className={`${riquadro} flex flex-col gap-4 sm:flex-row sm:items-center`}
    >
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <UserRoundPenIcon className="size-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <h2 id="titolo-completa-profilo" className="font-semibold">
          Completa il tuo profilo · {percentuale}%
        </h2>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentuale}
          aria-labelledby="titolo-completa-profilo"
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${percentuale}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">
          Aiuta Guido a conoscere te e la tua casa: potrà seguirti in modo più concreto.
        </p>
      </div>
      <Button size="lg" variant="outline" render={<Link href="/dashboard/profilo" />} nativeButton={false}>
        Completa il profilo
        <ArrowRightIcon aria-hidden />
      </Button>
    </section>
  );
}
