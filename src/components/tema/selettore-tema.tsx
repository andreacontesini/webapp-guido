"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CHIAVE_TEMA,
  EVENTO_TEMA,
  applicaTema,
  leggiPreferenza,
  salvaPreferenza,
  type PreferenzaTema,
} from "@/lib/tema";

const opzioni: { valore: PreferenzaTema; etichetta: string; icona: LucideIcon }[] = [
  { valore: "sistema", etichetta: "Tema di sistema", icona: MonitorIcon },
  { valore: "chiaro", etichetta: "Tema chiaro", icona: SunIcon },
  { valore: "scuro", etichetta: "Tema scuro", icona: MoonIcon },
];

function iscriviti(aggiorna: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === CHIAVE_TEMA) aggiorna();
  };
  window.addEventListener(EVENTO_TEMA, aggiorna);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENTO_TEMA, aggiorna);
    window.removeEventListener("storage", onStorage);
  };
}

/** Selettore Sistema / Chiaro / Scuro. Sul server non c'è preferenza: nessuna opzione evidenziata. */
export function SelettoreTema({ className }: { className?: string }) {
  const preferenza = useSyncExternalStore<PreferenzaTema | null>(
    iscriviti,
    leggiPreferenza,
    () => null
  );

  // Con "sistema", segue i cambi di tema del dispositivo in tempo reale.
  useEffect(() => {
    if (preferenza !== "sistema") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applicaTema("sistema");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preferenza]);

  return (
    <div
      role="radiogroup"
      aria-label="Tema dell'interfaccia"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border bg-muted p-0.5",
        className
      )}
    >
      {opzioni.map(({ valore, etichetta, icona: Icona }) => {
        const attivo = preferenza === valore;
        return (
          <button
            key={valore}
            type="button"
            role="radio"
            aria-checked={attivo}
            aria-label={etichetta}
            title={etichetta}
            onClick={() => salvaPreferenza(valore)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              attivo && "bg-background text-foreground shadow-sm"
            )}
          >
            <Icona className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
