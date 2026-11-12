"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import type { BloccoGalleria } from "@/lib/landing/blocchi";

type Immagine = BloccoGalleria["immagini"][number];

const colonneGriglia: Record<BloccoGalleria["colonne"], string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function Foto({ immagine, className }: { immagine: Immagine; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={immagine.url}
      alt={immagine.alt}
      loading="lazy"
      decoding="async"
      className={cn("size-full object-cover", className)}
    />
  );
}

// -------------------------------------------------------------
// Griglia con ingrandimento a schermo intero
// -------------------------------------------------------------

function Griglia({ immagini, colonne }: Pick<BloccoGalleria, "immagini" | "colonne">) {
  const [aperta, setAperta] = useState<number | null>(null);
  const totale = immagini.length;
  const sposta = (passo: number) =>
    setAperta((i) => (i === null ? i : (i + passo + totale) % totale));
  const corrente = aperta === null ? null : immagini[aperta];

  return (
    <>
      <ul className={cn("grid grid-cols-1 gap-3 sm:gap-4", colonneGriglia[colonne])}>
        {immagini.map((immagine, i) => (
          <li key={immagine.url + i}>
            <figure className="space-y-2">
              <button
                type="button"
                onClick={() => setAperta(i)}
                className="block aspect-[4/3] w-full overflow-hidden rounded-xl border focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                aria-label={`Ingrandisci: ${immagine.alt}`}
              >
                <Foto
                  immagine={immagine}
                  className="transition-transform duration-300 hover:scale-[1.03]"
                />
              </button>
              {immagine.didascalia && (
                <figcaption className="text-sm text-muted-foreground">
                  {immagine.didascalia}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <DialogPrimitive.Root open={corrente !== null} onOpenChange={(o) => !o && setAperta(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/90" />
          <DialogPrimitive.Popup
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") sposta(1);
              if (e.key === "ArrowLeft") sposta(-1);
            }}
          >
            {corrente && (
              <>
                <DialogPrimitive.Title className="sr-only">{corrente.alt}</DialogPrimitive.Title>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={corrente.url}
                  alt={corrente.alt}
                  className="max-h-[80dvh] max-w-full rounded-lg object-contain"
                />
                <p className="mt-3 max-w-2xl text-center text-sm text-white/80">
                  {corrente.didascalia ?? corrente.alt}
                  <span className="ml-2 text-white/50 tabular-nums">
                    {(aperta ?? 0) + 1}/{totale}
                  </span>
                </p>
                {totale > 1 && (
                  <div className="mt-4 flex gap-3">
                    <Button variant="secondary" size="icon-lg" onClick={() => sposta(-1)}>
                      <ChevronLeftIcon aria-hidden />
                      <span className="sr-only">Immagine precedente</span>
                    </Button>
                    <Button variant="secondary" size="icon-lg" onClick={() => sposta(1)}>
                      <ChevronRightIcon aria-hidden />
                      <span className="sr-only">Immagine successiva</span>
                    </Button>
                  </div>
                )}
                <DialogPrimitive.Close
                  render={
                    <Button variant="secondary" size="icon-lg" className="absolute top-4 right-4" />
                  }
                >
                  <XIcon aria-hidden />
                  <span className="sr-only">Chiudi</span>
                </DialogPrimitive.Close>
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

// -------------------------------------------------------------
// Carosello (swiper) con scorrimento nativo: trascinamento su smartphone
// -------------------------------------------------------------

const INTERVALLO_MS = 5000;

function Carosello({
  immagini,
  scorrimentoAutomatico,
}: Pick<BloccoGalleria, "immagini" | "scorrimentoAutomatico">) {
  const binario = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [inPausa, setInPausa] = useState(false);
  const totale = immagini.length;

  const vaiA = useCallback(
    (i: number) => {
      const el = binario.current;
      if (!el) return;
      const destinazione = (i + totale) % totale;
      el.scrollTo({ left: destinazione * el.clientWidth, behavior: "smooth" });
    },
    [totale],
  );

  // Indice della foto visibile, aggiornato durante lo scorrimento.
  const aggiornaIndice = () => {
    const el = binario.current;
    if (el && el.clientWidth) setIndice(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Scorrimento automatico: si ferma al passaggio del mouse, al tocco e se
  // l'utente preferisce ridurre le animazioni.
  useEffect(() => {
    if (!scorrimentoAutomatico || inPausa || totale < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => vaiA(indice + 1), INTERVALLO_MS);
    return () => window.clearInterval(timer);
  }, [scorrimentoAutomatico, inPausa, indice, totale, vaiA]);

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carosello"
      aria-label="Galleria immagini"
      onMouseEnter={() => setInPausa(true)}
      onMouseLeave={() => setInPausa(false)}
      onTouchStart={() => setInPausa(true)}
      onFocus={() => setInPausa(true)}
    >
      <div
        ref={binario}
        onScroll={aggiornaIndice}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {immagini.map((immagine, i) => (
          <figure
            key={immagine.url + i}
            className="relative aspect-[4/3] w-full shrink-0 snap-center sm:aspect-[16/9]"
            aria-roledescription="immagine"
            aria-label={`${i + 1} di ${totale}`}
          >
            <Foto immagine={immagine} />
            {immagine.didascalia && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-4 text-sm text-white">
                {immagine.didascalia}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {totale > 1 && (
        <>
          {/* Frecce solo da desktop: su smartphone si trascina col dito. */}
          <Button
            variant="secondary"
            size="icon-lg"
            className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full shadow-lg sm:inline-flex"
            onClick={() => vaiA(indice - 1)}
          >
            <ChevronLeftIcon aria-hidden />
            <span className="sr-only">Immagine precedente</span>
          </Button>
          <Button
            variant="secondary"
            size="icon-lg"
            className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full shadow-lg sm:inline-flex"
            onClick={() => vaiA(indice + 1)}
          >
            <ChevronRightIcon aria-hidden />
            <span className="sr-only">Immagine successiva</span>
          </Button>

          <div className="mt-4 flex justify-center gap-1">
            {immagini.map((immagine, i) => (
              <button
                key={immagine.url + i}
                type="button"
                onClick={() => vaiA(i)}
                aria-label={`Vai all'immagine ${i + 1}`}
                aria-current={i === indice}
                className="flex size-8 items-center justify-center"
              >
                <span
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === indice ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Galleria immagini a griglia (con ingrandimento) o a carosello. */
export function Galleria({
  immagini,
  modalita,
  colonne,
  scorrimentoAutomatico,
}: Pick<BloccoGalleria, "immagini" | "modalita" | "colonne" | "scorrimentoAutomatico">) {
  return modalita === "carosello" ? (
    <Carosello immagini={immagini} scorrimentoAutomatico={scorrimentoAutomatico} />
  ) : (
    <Griglia immagini={immagini} colonne={colonne} />
  );
}
