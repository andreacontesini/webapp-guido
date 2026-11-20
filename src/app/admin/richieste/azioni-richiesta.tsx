"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CircleCheckIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";

import { eliminaRichiesta, impostaGestita, type EsitoAzione } from "@/app/admin/richieste/azioni";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** "Segna come gestita" / "Da gestire" ed eliminazione con conferma. */
export function AzioniRichiesta({ id, nome, gestita }: { id: string; nome: string; gestita: boolean }) {
  const [inCorso, avvia] = useTransition();
  const [confermaAperta, setConfermaAperta] = useState(false);

  const esegui = (azione: () => Promise<EsitoAzione>, riuscita: string, dopo?: () => void) =>
    avvia(async () => {
      const esito = await azione();
      if (esito.errore) {
        toast.error(esito.errore);
        return;
      }
      toast.success(riuscita);
      dopo?.();
    });

  return (
    <div className="flex flex-wrap gap-2">
      {gestita ? (
        <Button
          variant="outline"
          size="sm"
          disabled={inCorso}
          onClick={() => esegui(() => impostaGestita(id, false), "Richiesta riportata tra quelle da gestire")}
        >
          <RotateCcwIcon aria-hidden />
          Da gestire
        </Button>
      ) : (
        <Button size="sm" disabled={inCorso} onClick={() => esegui(() => impostaGestita(id, true), "Richiesta gestita")}>
          <CircleCheckIcon aria-hidden />
          Segna come gestita
        </Button>
      )}
      <Dialog open={confermaAperta} onOpenChange={setConfermaAperta}>
        <DialogTrigger
          render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />}
          aria-label={`Elimina la richiesta di ${nome}`}
        >
          <Trash2Icon aria-hidden />
          Elimina
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare la richiesta?</DialogTitle>
            <DialogDescription>
              La richiesta di {nome} verrà cancellata definitivamente. Se vuoi solo toglierla dall&apos;elenco da
              gestire, usa «Segna come gestita».
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Annulla</DialogClose>
            <Button
              variant="destructive"
              size="lg"
              disabled={inCorso}
              onClick={() => esegui(() => eliminaRichiesta(id), "Richiesta eliminata", () => setConfermaAperta(false))}
            >
              {inCorso ? "Eliminazione…" : "Elimina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
