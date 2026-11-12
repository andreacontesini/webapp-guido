"use client";

import { useState, useTransition } from "react";
import { DownloadIcon, LoaderCircleIcon, UserRoundSearchIcon } from "lucide-react";

import { leggiDettaglioProfilo, type DettaglioProfilo } from "@/app/admin/utenti/azioni-profilo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GruppoRiepilogo } from "@/lib/profilo/riepilogo";

/**
 * Profilo del cliente nella tabella admin: la percentuale è nella pagina, i
 * dati (via, note, situazione della casa) si caricano solo all'apertura del
 * popup. Dal popup si scarica la scheda cliente in PDF.
 */
export function ProfiloUtente({ id, nome, percentuale }: { id: string; nome: string; percentuale: number }) {
  const [dettaglio, setDettaglio] = useState<DettaglioProfilo | null>(null);
  const [inCaricamento, avvia] = useTransition();

  const carica = (aperto: boolean) => {
    // Si ricarica a ogni apertura: il cliente potrebbe aver aggiornato il profilo.
    if (!aperto) return;
    avvia(async () => setDettaglio(await leggiDettaglioProfilo(id)));
  };

  return (
    <Dialog onOpenChange={carica}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="h-auto gap-2 py-1.5" />}
        aria-label={`Vedi il profilo di ${nome} (completo al ${percentuale}%)`}
      >
        <UserRoundSearchIcon aria-hidden />
        <span>Vedi profilo</span>
        <span className="flex items-center gap-1.5 text-muted-foreground tabular-nums">
          <span aria-hidden className="h-1.5 w-8 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${percentuale}%` }} />
          </span>
          {percentuale}%
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{nome}</DialogTitle>
          <DialogDescription>Profilo completo al {percentuale}%</DialogDescription>
        </DialogHeader>

        {inCaricamento || !dettaglio ? (
          <p className="flex items-center gap-2 py-6 text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
            Caricamento del profilo…
          </p>
        ) : "errore" in dettaglio ? (
          <p role="alert" className="py-6 text-destructive">
            {dettaglio.errore}
          </p>
        ) : (
          <div className="space-y-5">
            {dettaglio.gruppi.map((gruppo) => (
              <Gruppo key={gruppo.titolo} gruppo={gruppo} />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button render={<a href={`/admin/utenti/${id}/scheda.pdf`} />} nativeButton={false}>
            <DownloadIcon aria-hidden />
            Scarica scheda cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Gruppo({ gruppo }: { gruppo: GruppoRiepilogo }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{gruppo.titolo}</h3>
      <dl className="divide-y rounded-lg border text-sm">
        {gruppo.righe.map(({ etichetta, valore }) => (
          <div key={etichetta} className="grid gap-1 px-3 py-2 sm:grid-cols-[14rem_1fr] sm:gap-3">
            <dt className="text-muted-foreground">{etichetta}</dt>
            <dd className={valore ? "whitespace-pre-line" : "text-muted-foreground"}>{valore ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
