"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import { cn } from "cn";

import { analizzaVideo, type BloccoVideo, type SorgenteVideo } from "@/lib/landing/blocchi";

type Impostazioni = Pick<
  BloccoVideo,
  | "indirizzo"
  | "copertinaUrl"
  | "formato"
  | "avvioAutomatico"
  | "muto"
  | "ripeti"
  | "controlli"
  | "sottotitoli"
  | "inizio"
> & { titolo?: string };

const proporzioni: Record<BloccoVideo["formato"], string> = {
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16] max-w-sm",
  "1:1": "aspect-square max-w-xl",
};

const si = (v: boolean) => (v ? "1" : "0");

/** Indirizzo del player incorporato, con le impostazioni del blocco. */
function urlIncorporato(s: Exclude<SorgenteVideo, { tipo: "file" }>, imp: Impostazioni) {
  const inizio = imp.inizio ?? 0;
  switch (s.tipo) {
    case "bunny": {
      const q = new URLSearchParams({
        autoplay: "true",
        muted: String(imp.muto),
        loop: String(imp.ripeti),
        preload: "true",
        responsive: "true",
        playsinline: "true",
      });
      if (inizio) q.set("t", String(inizio));
      if (imp.sottotitoli) q.set("captions", "it");
      return `https://iframe.mediadelivery.net/embed/${s.libreria}/${s.video}?${q}`;
    }
    case "youtube": {
      const q = new URLSearchParams({
        autoplay: "1",
        mute: si(imp.muto),
        controls: si(imp.controlli),
        playsinline: "1",
        rel: "0",
        modestbranding: "1",
      });
      if (inizio) q.set("start", String(inizio));
      if (imp.ripeti) {
        q.set("loop", "1");
        q.set("playlist", s.video);
      }
      if (imp.sottotitoli) {
        q.set("cc_load_policy", "1");
        q.set("cc_lang_pref", "it");
      }
      // Dominio "nocookie": nessun cookie di profilazione finché non si guarda.
      return `https://www.youtube-nocookie.com/embed/${s.video}?${q}`;
    }
    case "vimeo": {
      const q = new URLSearchParams({
        autoplay: "1",
        muted: si(imp.muto),
        loop: si(imp.ripeti),
        controls: si(imp.controlli),
        playsinline: "1",
        dnt: "1",
      });
      if (s.hash) q.set("h", s.hash);
      if (imp.sottotitoli) q.set("texttrack", "it");
      return `https://player.vimeo.com/video/${s.video}?${q}${inizio ? `#t=${inizio}s` : ""}`;
    }
  }
}

/**
 * Player ottimizzato per smartphone: finché non serve mostra solo una
 * copertina leggera con un grande pulsante play; il player vero si carica al
 * tocco oppure, con l'avvio automatico, quando il video entra nello schermo.
 * Riproduzione nella pagina (playsinline) e spazio riservato dal formato,
 * così il layout non salta.
 */
export function PlayerVideo(imp: Impostazioni) {
  const sorgente = analizzaVideo(imp.indirizzo);
  const contenitore = useRef<HTMLDivElement>(null);
  const [attivo, setAttivo] = useState(false);

  // Avvio automatico: si attiva quando metà del video è visibile.
  useEffect(() => {
    if (!imp.avvioAutomatico || attivo || !contenitore.current) return;
    const osservatore = new IntersectionObserver(
      ([voce]) => {
        if (voce?.isIntersecting) {
          setAttivo(true);
          osservatore.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    osservatore.observe(contenitore.current);
    return () => osservatore.disconnect();
  }, [imp.avvioAutomatico, attivo]);

  if (!sorgente) return null;

  const copertina =
    imp.copertinaUrl ??
    (sorgente.tipo === "youtube" ? `https://i.ytimg.com/vi/${sorgente.video}/hqdefault.jpg` : undefined);
  const etichetta = imp.titolo ? `Riproduci il video: ${imp.titolo}` : "Riproduci il video";

  return (
    <div
      ref={contenitore}
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-xl border bg-black shadow-xl",
        proporzioni[imp.formato],
      )}
    >
      {attivo ? (
        sorgente.tipo === "file" ? (
          <video
            className="size-full object-contain"
            src={imp.inizio ? `${sorgente.url}#t=${imp.inizio}` : sorgente.url}
            poster={copertina}
            autoPlay
            playsInline
            muted={imp.muto}
            loop={imp.ripeti}
            controls={imp.controlli}
            preload="auto"
          />
        ) : (
          <iframe
            className="absolute inset-0 size-full"
            src={urlIncorporato(sorgente, imp)}
            title={imp.titolo ?? "Video"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => setAttivo(true)}
          className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none"
          aria-label={etichetta}
        >
          {copertina ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={copertina}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background to-background" />
          )}
          <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" />
          {/* Area di tocco ampia: 80px. */}
          <span className="relative inline-flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl ring-8 ring-white/15 transition-transform group-hover:scale-105 group-focus-visible:ring-ring">
            <PlayIcon className="ml-1 size-9 fill-current" aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}
