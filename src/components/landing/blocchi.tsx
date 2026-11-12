import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  MapPinIcon,
  QuoteIcon,
} from "lucide-react";
import { cn } from "cn";

import { PopupAcquisto } from "@/components/acquisto/popup-acquisto";
import { Galleria as GalleriaImmagini } from "@/components/landing/galleria";
import { PlayerVideo } from "@/components/landing/player-video";
import { SfondoHero } from "@/components/layout/sfondo-hero";
import { iconePunti } from "@/components/landing/icone";
import { Button } from "@/components/ui/button";
import { PERCORSO_ACCESSO } from "@/lib/auth/percorsi";
import type {
  Blocco,
  BloccoAutore,
  BloccoFaq,
  BloccoGalleria,
  BloccoHero,
  BloccoImmagine,
  BloccoInvito,
  BloccoPrezzo,
  BloccoPuntiChiave,
  BloccoTappe,
  BloccoTestimonianze,
  BloccoTesto,
  BloccoVideo,
} from "@/lib/landing/blocchi";
import { formattaPrezzo, prodotti } from "@/lib/prodotti";
import { linkApp } from "@/lib/url";

/** Dati comuni a tutti i blocchi di una landing. */
export type ContestoLanding = {
  /** Stripe configurato e prezzo definito: il popup apre il pagamento. */
  pagamentoAttivo: boolean;
  /** Ancora della sezione con le tappe, per il link "Scopri cosa contiene". */
  ancoraContenuti?: string;
  /** Id della landing, per attribuirle i checkout (misurazione conversioni). */
  origine?: string;
};

const guida = prodotti.guida;
const prezzoGuida: number | null = guida.prezzo;

// -------------------------------------------------------------
// Struttura comune
// -------------------------------------------------------------

function Sezione({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 sm:py-24", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function TitoloSezione({
  titolo,
  sottotitolo,
  centrato = true,
}: {
  titolo?: string;
  sottotitolo?: string;
  centrato?: boolean;
}) {
  if (!titolo && !sottotitolo) return null;
  return (
    <header className={cn("mb-10 max-w-2xl space-y-3 sm:mb-14", centrato && "mx-auto text-center")}>
      {titolo && (
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{titolo}</h2>
      )}
      {sottotitolo && (
        <p className="text-lg text-pretty text-muted-foreground">{sottotitolo}</p>
      )}
    </header>
  );
}

function PulsanteAcquisto({
  contesto,
  className,
  etichetta,
}: {
  contesto: ContestoLanding;
  className?: string;
  etichetta?: string;
}) {
  return (
    <PopupAcquisto
      prodotto="guida"
      pagamentoAttivo={contesto.pagamentoAttivo}
      etichetta={etichetta}
      className={className}
      origine={contesto.origine}
      diretto
    />
  );
}

const SpuntaElenco = () => (
  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
    <CheckIcon className="size-3.5" aria-hidden />
  </span>
);

// -------------------------------------------------------------
// Blocchi
// -------------------------------------------------------------

function Hero({ blocco, contesto }: { blocco: BloccoHero; contesto: ContestoLanding }) {
  const numeri = blocco.numeri ?? [];
  return (
    <section id={blocco.id} className="relative isolate overflow-hidden">
      <SfondoHero />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="space-y-8 text-center lg:text-left">
          {blocco.etichetta && (
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {blocco.etichetta}
            </p>
          )}

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {blocco.titolo}
              {blocco.evidenza && (
                <>
                  {" "}
                  <span className="text-primary">{blocco.evidenza}</span>
                </>
              )}
            </h1>
            <p className="mx-auto max-w-xl text-lg text-pretty text-muted-foreground lg:mx-0">
              {blocco.sottotitolo}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <PulsanteAcquisto contesto={contesto} className="w-full sm:w-auto" />
              {contesto.ancoraContenuti && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  render={<a href={`#${contesto.ancoraContenuti}`} />}
                  nativeButton={false}
                >
                  Scopri cosa contiene
                  <ArrowDownIcon aria-hidden />
                </Button>
              )}
            </div>
            {blocco.nota && <p className="text-sm text-muted-foreground">{blocco.nota}</p>}
          </div>

          {numeri.length > 0 && (
            <dl
              className={cn(
                "grid gap-4 border-t pt-8 text-left",
                numeri.length >= 3 ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              {numeri.map(({ valore, etichetta }) => (
                <div key={etichetta} className="space-y-1">
                  <dt className="sr-only">{etichetta}</dt>
                  <dd className="text-3xl font-semibold tabular-nums sm:text-4xl">{valore}</dd>
                  <dd className="text-xs text-muted-foreground sm:text-sm">{etichetta}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <CopertinaGuida />
      </div>
    </section>
  );
}

/** Copertina illustrativa della guida (con i testi reali della copertina). */
function CopertinaGuida() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-64 sm:max-w-sm">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/5 to-transparent blur-2xl" />
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border bg-card/60" />
      <div className="relative flex aspect-[3/4] flex-col rounded-2xl border bg-card p-7 shadow-2xl sm:p-9">
        <p className="text-[0.65rem] font-medium tracking-[0.3em] text-muted-foreground uppercase">
          Guida pratica per
        </p>
        <p className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          Una vendita
          <br />
          <span className="text-primary">buona e giusta</span>
        </p>
        <p className="mt-4 text-sm text-pretty text-muted-foreground">
          Dai controlli preliminari al rogito notarile: tutto quello che ogni proprietario
          dovrebbe sapere prima di vendere casa.
        </p>
        <div className="mt-auto space-y-3">
          <div className="flex gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="h-1 flex-1 rounded-full bg-primary/70" />
            ))}
          </div>
          <div className="flex items-end justify-between text-sm">
            <span className="font-medium">Guido Contesini</span>
            <span className="tracking-[0.3em] text-muted-foreground tabular-nums">2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PuntiChiave({ blocco }: { blocco: BloccoPuntiChiave }) {
  return (
    <Sezione id={blocco.id}>
      <TitoloSezione titolo={blocco.titolo} sottotitolo={blocco.sottotitolo} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {blocco.punti.map(({ icona, titolo, testo }) => {
          const Icona = iconePunti[icona];
          return (
            <li key={titolo} className="rounded-xl border bg-card p-6 text-card-foreground">
              <span className="mb-5 inline-flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icona className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{titolo}</h3>
              <p className="mt-2 text-pretty text-muted-foreground">{testo}</p>
            </li>
          );
        })}
      </ul>
    </Sezione>
  );
}

function Tappe({ blocco }: { blocco: BloccoTappe }) {
  return (
    <Sezione id={blocco.id} className="border-y bg-muted/30">
      <TitoloSezione titolo={blocco.titolo} sottotitolo={blocco.sottotitolo} />
      <ol className="mx-auto grid max-w-4xl gap-3">
        {blocco.tappe.map(({ titolo, testo }, i) => (
          <li
            key={titolo}
            className="flex items-start gap-4 rounded-xl border bg-background p-4 sm:items-center sm:gap-6 sm:p-5"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground tabular-nums sm:size-12 sm:text-base">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 sm:flex sm:flex-1 sm:items-baseline sm:gap-4">
              <h3 className="font-semibold sm:w-56 sm:shrink-0">{titolo}</h3>
              <p className="mt-0.5 text-pretty text-muted-foreground sm:mt-0">{testo}</p>
            </div>
          </li>
        ))}
      </ol>
    </Sezione>
  );
}

function Testo({ blocco }: { blocco: BloccoTesto }) {
  return (
    <Sezione id={blocco.id}>
      <div className="mx-auto max-w-3xl space-y-5">
        {blocco.titolo && (
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {blocco.titolo}
          </h2>
        )}
        {blocco.paragrafi.map((paragrafo, i) => (
          <p key={i} className="text-lg text-pretty text-muted-foreground">
            {paragrafo}
          </p>
        ))}
      </div>
    </Sezione>
  );
}

function Immagine({ blocco }: { blocco: BloccoImmagine }) {
  return (
    <Sezione id={blocco.id}>
      <figure className="mx-auto max-w-4xl space-y-3">
        {/* Immagini da indirizzi esterni (Storage pubblico, Fase 9): niente next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blocco.url}
          alt={blocco.alt}
          loading="lazy"
          className="w-full rounded-xl border object-cover"
        />
        {blocco.didascalia && (
          <figcaption className="text-center text-sm text-muted-foreground">
            {blocco.didascalia}
          </figcaption>
        )}
      </figure>
    </Sezione>
  );
}

function Testimonianze({ blocco }: { blocco: BloccoTestimonianze }) {
  return (
    <Sezione id={blocco.id}>
      <TitoloSezione titolo={blocco.titolo} />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blocco.elementi.map(({ testo, nome, dettaglio }) => (
          <li key={nome + testo.slice(0, 20)}>
            <figure className="flex h-full flex-col rounded-xl border bg-card p-6">
              <QuoteIcon className="mb-4 size-6 text-primary" aria-hidden />
              <blockquote className="flex-1 text-pretty">{testo}</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-medium">{nome}</span>
                {dettaglio && <span className="text-muted-foreground"> · {dettaglio}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Sezione>
  );
}

function Autore({ blocco }: { blocco: BloccoAutore }) {
  const iniziali = blocco.nome
    .split(/\s+/)
    .map((parola) => parola[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Sezione id={blocco.id}>
      <div className="mx-auto grid max-w-5xl items-center gap-8 rounded-2xl border bg-card p-6 sm:p-10 md:grid-cols-[auto_1fr] md:gap-12">
        <div className="flex flex-col items-center gap-4 text-center md:w-56">
          {blocco.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blocco.fotoUrl}
              alt={blocco.nome}
              className="size-32 rounded-full border object-cover sm:size-40"
            />
          ) : (
            <span
              aria-hidden
              className="inline-flex size-32 items-center justify-center rounded-full bg-accent text-4xl font-semibold text-accent-foreground sm:size-40"
            >
              {iniziali}
            </span>
          )}
          <div>
            <p className="text-lg font-semibold">{blocco.nome}</p>
            <p className="text-sm text-muted-foreground">{blocco.ruolo}</p>
            {blocco.luogo && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5" aria-hidden />
                {blocco.luogo}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {blocco.titolo && (
            <h2 className="text-3xl font-semibold tracking-tight text-balance">{blocco.titolo}</h2>
          )}
          {blocco.paragrafi.map((paragrafo, i) => (
            <p key={i} className="text-lg text-pretty text-muted-foreground">
              {paragrafo}
            </p>
          ))}
        </div>
      </div>
    </Sezione>
  );
}

function Faq({ blocco }: { blocco: BloccoFaq }) {
  return (
    <Sezione id={blocco.id}>
      <TitoloSezione titolo={blocco.titolo} />
      {/* <details> nativi: si aprono anche senza JavaScript. */}
      <div className="mx-auto max-w-3xl divide-y rounded-xl border bg-card">
        {blocco.domande.map(({ domanda, risposta }) => (
          <details key={domanda} className="group px-5 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium [&::-webkit-details-marker]:hidden">
              {domanda}
              <ChevronDownIcon
                className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="-mt-1 pb-5 text-pretty text-muted-foreground">{risposta}</p>
          </details>
        ))}
      </div>
    </Sezione>
  );
}

function Prezzo({ blocco, contesto }: { blocco: BloccoPrezzo; contesto: ContestoLanding }) {
  return (
    <Sezione id={blocco.id ?? "acquista"} className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -z-10 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-6 shadow-xl sm:p-10">
        <div className="space-y-2 text-center">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {guida.nome}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">{blocco.titolo}</h2>
          {blocco.sottotitolo && (
            <p className="text-pretty text-muted-foreground">{blocco.sottotitolo}</p>
          )}
        </div>

        <p className="my-8 text-center">
          {prezzoGuida === null ? (
            <span className="text-2xl font-semibold">Prezzo in arrivo</span>
          ) : (
            <>
              <span className="text-5xl font-semibold tracking-tight tabular-nums">
                {formattaPrezzo(prezzoGuida)}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                IVA inclusa · pagamento unico
              </span>
            </>
          )}
        </p>

        <ul className="space-y-3">
          {guida.inclusi.map((punto) => (
            <li key={punto} className="flex gap-3 text-pretty">
              <SpuntaElenco />
              {punto}
            </li>
          ))}
        </ul>

        <PulsanteAcquisto contesto={contesto} className="mt-8 w-full" />

        {blocco.garanzie.length > 0 && (
          <ul className="mt-6 grid gap-2 border-t pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            {blocco.garanzie.map((garanzia) => (
              <li key={garanzia} className="flex gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {garanzia}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sezione>
  );
}

function Invito({ blocco, contesto }: { blocco: BloccoInvito; contesto: ContestoLanding }) {
  const accedi = blocco.azione === "accedi";
  return (
    <Sezione id={blocco.id} className="py-10 sm:py-14">
      <div
        className={cn(
          "flex flex-col items-center gap-6 rounded-2xl border p-6 text-center sm:p-10 md:flex-row md:justify-between md:text-left",
          accedi ? "bg-card" : "border-primary/30 bg-accent/60",
        )}
      >
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-balance">{blocco.titolo}</h2>
          {blocco.testo && <p className="text-pretty text-muted-foreground">{blocco.testo}</p>}
        </div>
        {accedi ? (
          <Button
            size="lg"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            render={<Link href={linkApp(PERCORSO_ACCESSO)} />}
            nativeButton={false}
          >
            Accedi alla tua area
            <ArrowRightIcon aria-hidden />
          </Button>
        ) : (
          <PulsanteAcquisto contesto={contesto} className="w-full shrink-0 sm:w-auto" />
        )}
      </div>
    </Sezione>
  );
}

function Video({ blocco, contesto }: { blocco: BloccoVideo; contesto: ContestoLanding }) {
  return (
    <Sezione id={blocco.id}>
      <TitoloSezione titolo={blocco.titolo} sottotitolo={blocco.testo} />
      <div className="mx-auto max-w-4xl">
        <PlayerVideo
          indirizzo={blocco.indirizzo}
          titolo={blocco.titolo}
          copertinaUrl={blocco.copertinaUrl}
          formato={blocco.formato}
          avvioAutomatico={blocco.avvioAutomatico}
          muto={blocco.muto}
          ripeti={blocco.ripeti}
          controlli={blocco.controlli}
          sottotitoli={blocco.sottotitoli}
          inizio={blocco.inizio}
        />
      </div>
      {blocco.pulsanteAcquisto && (
        <div className="mt-8 flex justify-center">
          <PulsanteAcquisto contesto={contesto} className="w-full sm:w-auto" />
        </div>
      )}
    </Sezione>
  );
}

function Galleria({ blocco }: { blocco: BloccoGalleria }) {
  return (
    <Sezione id={blocco.id}>
      <TitoloSezione titolo={blocco.titolo} />
      <div className={blocco.modalita === "carosello" ? "mx-auto max-w-4xl" : undefined}>
        <GalleriaImmagini
          immagini={blocco.immagini}
          modalita={blocco.modalita}
          colonne={blocco.colonne}
          scorrimentoAutomatico={blocco.scorrimentoAutomatico}
        />
      </div>
    </Sezione>
  );
}

// -------------------------------------------------------------
// Smistamento
// -------------------------------------------------------------

export function BloccoLanding({
  blocco,
  contesto,
}: {
  blocco: Blocco;
  contesto: ContestoLanding;
}) {
  switch (blocco.tipo) {
    case "hero":
      return <Hero blocco={blocco} contesto={contesto} />;
    case "punti-chiave":
      return <PuntiChiave blocco={blocco} />;
    case "tappe":
      return <Tappe blocco={blocco} />;
    case "testo":
      return <Testo blocco={blocco} />;
    case "immagine":
      return <Immagine blocco={blocco} />;
    case "testimonianze":
      return <Testimonianze blocco={blocco} />;
    case "autore":
      return <Autore blocco={blocco} />;
    case "faq":
      return <Faq blocco={blocco} />;
    case "prezzo":
      return <Prezzo blocco={blocco} contesto={contesto} />;
    case "invito":
      return <Invito blocco={blocco} contesto={contesto} />;
    case "video":
      return <Video blocco={blocco} contesto={contesto} />;
    case "galleria":
      return <Galleria blocco={blocco} />;
  }
}
