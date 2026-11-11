"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircleIcon, MinusIcon, PlusIcon, ScanIcon } from "lucide-react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
const PASSO_ZOOM = 0.2;
/** Larghezza massima di una pagina a zoom 100% (px CSS). */
const LARGHEZZA_MAX = 900;

type Props = {
  /** Route protetta che restituisce il PDF. */
  url: string;
  /** Testo principale della filigrana disegnata su ogni pagina. */
  filigrana: string;
  /** Seconda riga, in piccolo (es. email dell'utente, per risalire a copie diffuse). */
  filigranaDettaglio?: string;
};

/**
 * Build "legacy" di pdf.js: include i polyfill per i browser meno recenti
 * (es. iPhone con iOS < 18), che altrimenti non aprirebbero la guida.
 */
async function caricaPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjs;
}

/**
 * Lettore della guida: disegna le pagine su canvas (niente link di download
 * né lettore nativo del browser), con la filigrana disegnata dentro l'immagine.
 * Non è una protezione assoluta, ma scoraggia copia e diffusione.
 */
export function LettorePdf({ url, filigrana, filigranaDettaglio }: Props) {
  const contenitore = useRef<HTMLDivElement>(null);
  const [documento, setDocumento] = useState<PDFDocumentProxy | null>(null);
  const [rapporto, setRapporto] = useState(1.414); // altezza/larghezza (A4)
  const [errore, setErrore] = useState<string | null>(null);
  const [larghezza, setLarghezza] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [paginaCorrente, setPaginaCorrente] = useState(1);

  // Caricamento del documento.
  useEffect(() => {
    let annullato = false;
    let caricamento: PDFDocumentLoadingTask | null = null;
    (async () => {
      try {
        const pdfjs = await caricaPdfjs();
        if (annullato) return;
        caricamento = pdfjs.getDocument({ url, withCredentials: true });
        const doc = await caricamento.promise;
        if (annullato) return;
        const prima = await doc.getPage(1);
        const vp = prima.getViewport({ scale: 1 });
        setRapporto(vp.height / vp.width);
        setDocumento(doc);
      } catch (e) {
        console.error(e);
        if (!annullato) {
          setErrore("Non siamo riusciti ad aprire la guida. Ricarica la pagina o riprova più tardi.");
        }
      }
    })();
    return () => {
      annullato = true;
      void caricamento?.destroy();
    };
  }, [url]);

  // Larghezza disponibile, aggiornata al ridimensionamento.
  useEffect(() => {
    const el = contenitore.current;
    if (!el) return;
    const osservatore = new ResizeObserver(([voce]) => {
      setLarghezza(Math.floor(voce.contentRect.width));
    });
    osservatore.observe(el);
    return () => osservatore.disconnect();
  }, []);

  const larghezzaPagina = Math.round(Math.min(larghezza, LARGHEZZA_MAX) * zoom);

  const vaiAPagina = useCallback((numero: number) => {
    document
      .getElementById(`pagina-${numero}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const totale = documento?.numPages ?? 0;

  return (
    <div
      className="select-none print:hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Barra strumenti */}
      <div className="sticky top-16 z-20 -mx-4 mb-4 flex items-center justify-between gap-2 border-b bg-background/90 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
          {totale > 0 ? (
            <>
              Pagina <span className="font-medium text-foreground">{paginaCorrente}</span> di {totale}
            </>
          ) : (
            "Caricamento…"
          )}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Riduci"
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - PASSO_ZOOM).toFixed(1)))}
          >
            <MinusIcon aria-hidden />
          </Button>
          <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ingrandisci"
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + PASSO_ZOOM).toFixed(1)))}
          >
            <PlusIcon aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Adatta alla larghezza"
            disabled={zoom === 1}
            onClick={() => setZoom(1)}
          >
            <ScanIcon aria-hidden />
          </Button>
        </div>
      </div>

      <div ref={contenitore} className="w-full overflow-x-auto">
        {errore ? (
          <p role="alert" className="rounded-lg border bg-card p-6 text-sm">
            {errore}
          </p>
        ) : !documento || larghezza === 0 ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
            Apertura della guida…
          </div>
        ) : (
          <div className="mx-auto flex w-max flex-col items-center gap-4 pb-8">
            {Array.from({ length: totale }, (_, i) => (
              <PaginaPdf
                key={i + 1}
                documento={documento}
                numero={i + 1}
                larghezza={larghezzaPagina}
                altezzaStimata={Math.round(larghezzaPagina * rapporto)}
                filigrana={filigrana}
                filigranaDettaglio={filigranaDettaglio}
                onVisibile={setPaginaCorrente}
              />
            ))}
          </div>
        )}
      </div>

      {totale > 1 && (
        <div className="flex justify-center pb-4">
          <Button variant="outline" onClick={() => vaiAPagina(1)}>
            Torna all&apos;inizio
          </Button>
        </div>
      )}
    </div>
  );
}

function PaginaPdf({
  documento,
  numero,
  larghezza,
  altezzaStimata,
  filigrana,
  filigranaDettaglio,
  onVisibile,
}: {
  documento: PDFDocumentProxy;
  numero: number;
  larghezza: number;
  altezzaStimata: number;
  filigrana: string;
  filigranaDettaglio?: string;
  onVisibile: (numero: number) => void;
}) {
  const riquadro = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const [vicina, setVicina] = useState(false);
  const [altezza, setAltezza] = useState(altezzaStimata);
  const [pronta, setPronta] = useState(false);

  // Disegna solo le pagine vicine allo schermo; segnala quella in vista.
  useEffect(() => {
    const el = riquadro.current;
    if (!el) return;
    const vicinanza = new IntersectionObserver(
      ([voce]) => setVicina(voce.isIntersecting),
      { rootMargin: "800px 0px" },
    );
    const inVista = new IntersectionObserver(
      ([voce]) => voce.isIntersecting && onVisibile(numero),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    vicinanza.observe(el);
    inVista.observe(el);
    return () => {
      vicinanza.disconnect();
      inVista.disconnect();
    };
  }, [numero, onVisibile]);

  useEffect(() => {
    if (!vicina || !tela.current) return;
    let compito: RenderTask | null = null;
    let annullato = false;

    (async () => {
      const pagina = await documento.getPage(numero);
      if (annullato || !tela.current) return;
      const base = pagina.getViewport({ scale: 1 });
      const scala = larghezza / base.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = pagina.getViewport({ scale: scala * dpr });

      const canvas = tela.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${larghezza}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
      setAltezza(Math.floor(viewport.height / dpr));

      compito = pagina.render({ canvas, viewport });
      try {
        await compito.promise;
      } catch {
        return; // render annullato (zoom o scroll veloce)
      }
      if (annullato) return;
      disegnaFiligrana(canvas, dpr, filigrana, filigranaDettaglio);
      setPronta(true);
    })();

    return () => {
      annullato = true;
      compito?.cancel();
    };
  }, [vicina, documento, numero, larghezza, filigrana, filigranaDettaglio]);

  return (
    <div
      id={`pagina-${numero}`}
      ref={riquadro}
      className="relative scroll-mt-32 overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-border"
      style={{ width: larghezza, height: pronta ? undefined : altezza }}
    >
      <canvas
        ref={tela}
        role="img"
        aria-label={`Pagina ${numero}`}
        className={cn("block transition-opacity", pronta ? "opacity-100" : "opacity-0")}
        draggable={false}
      />
      {!pronta && (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
          {numero}
        </span>
      )}
    </div>
  );
}

/**
 * Filigrana diagonale ripetuta, disegnata nel canvas (non rimovibile dal DOM):
 * testo principale e, sotto, una riga di dettaglio più piccola.
 */
function disegnaFiligrana(
  canvas: HTMLCanvasElement,
  dpr: number,
  testo: string,
  dettaglio?: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dimensione = Math.max(11, canvas.width / dpr / 42) * dpr;
  const dimensioneDettaglio = Math.max(8, dimensione / dpr * 0.55) * dpr;
  const fontPrincipale = `600 ${dimensione}px system-ui, sans-serif`;
  const fontDettaglio = `500 ${dimensioneDettaglio}px system-ui, sans-serif`;

  ctx.save();
  // Grigio medio: si legge sia sulle pagine chiare sia su quelle scure (copertina).
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#7c8799";
  ctx.textAlign = "center";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);

  ctx.font = fontPrincipale;
  // Spaziatura ampia: poche ripetizioni per pagina, senza coprire il testo.
  const passoX = ctx.measureText(testo).width + dimensione * 12;
  const passoY = dimensione * 16;
  const diagonale = Math.hypot(canvas.width, canvas.height);
  for (let y = -diagonale / 2; y < diagonale / 2; y += passoY) {
    const sfasamento = (Math.round(y / passoY) % 2) * (passoX / 2);
    for (let x = -diagonale / 2; x < diagonale / 2; x += passoX) {
      ctx.font = fontPrincipale;
      ctx.fillText(testo, x + sfasamento, y);
      if (dettaglio) {
        ctx.font = fontDettaglio;
        ctx.fillText(dettaglio, x + sfasamento, y + dimensione * 0.95);
      }
    }
  }
  ctx.restore();
}
