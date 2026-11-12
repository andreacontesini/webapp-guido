import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Azione = { etichetta: string; href: string };

/** Riquadro centrato per gli esiti di un acquisto (conferma, attesa, annullato). */
export function EsitoAcquisto({
  icona: Icona,
  tono,
  titolo,
  children,
  azionePrincipale,
  azioneSecondaria,
  pulsantePrincipale,
  animaIcona,
}: {
  icona: LucideIcon;
  tono: "successo" | "attesa" | "neutro";
  titolo: string;
  children: React.ReactNode;
  azionePrincipale?: Azione;
  azioneSecondaria?: Azione;
  /** Pulsante principale personalizzato (es. il popup di acquisto), al posto di `azionePrincipale`. */
  pulsantePrincipale?: React.ReactNode;
  animaIcona?: boolean;
}) {
  return (
    <section
      aria-live="polite"
      className="relative mx-auto mt-4 max-w-lg overflow-hidden rounded-xl border bg-card p-6 text-center text-card-foreground sm:mt-10 sm:p-10"
    >
      {tono === "successo" && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
      )}
      <span
        className={cn(
          "relative mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full",
          tono === "successo" && "bg-primary text-primary-foreground",
          tono === "attesa" && "bg-accent text-accent-foreground",
          tono === "neutro" && "bg-muted text-muted-foreground",
        )}
      >
        <Icona className={cn("size-7", animaIcona && "animate-spin")} aria-hidden />
      </span>
      <h1 className="relative text-2xl font-semibold tracking-tight">{titolo}</h1>
      <div className="relative mt-2 space-y-2 text-muted-foreground">{children}</div>

      {(azionePrincipale || azioneSecondaria || pulsantePrincipale) && (
        <div className="relative mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {azioneSecondaria && (
            <Button
              variant="outline"
              size="lg"
              render={<Link href={azioneSecondaria.href} />}
              nativeButton={false}
            >
              {azioneSecondaria.etichetta}
            </Button>
          )}
          {pulsantePrincipale}
          {!pulsantePrincipale && azionePrincipale && (
            <Button size="lg" render={<Link href={azionePrincipale.href} />} nativeButton={false}>
              {azionePrincipale.etichetta}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
