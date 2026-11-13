"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PauseIcon, PlayIcon, SendIcon, Trash2Icon } from "lucide-react";

import { eliminaDestinatario, impostaPausa, inviaProva, type EsitoAzione } from "@/app/admin/notifiche/azioni";
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

/** Pausa, notifica di prova e rimozione di un destinatario. */
export function AzioniDestinatario({ id, email, inPausa }: { id: string; email: string; inPausa: boolean }) {
  const [inCorso, avvia] = useTransition();
  const [confermaAperta, setConfermaAperta] = useState(false);

  const esegui = (azione: () => Promise<EsitoAzione>, riuscita?: string, dopo?: () => void) =>
    avvia(async () => {
      const esito = await azione();
      if (esito.errore) {
        toast.error(esito.errore);
        return;
      }
      const messaggio = esito.messaggio ?? riuscita;
      if (messaggio) toast.success(messaggio);
      dopo?.();
    });

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={inCorso}
        onClick={() => esegui(() => inviaProva(id))}
      >
        <SendIcon aria-hidden />
        Invia prova
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={inCorso}
        onClick={() =>
          esegui(() => impostaPausa(id, !inPausa), inPausa ? `${email} riceve di nuovo le notifiche` : `${email} in pausa`)
        }
      >
        {inPausa ? <PlayIcon aria-hidden /> : <PauseIcon aria-hidden />}
        {inPausa ? "Riattiva" : "Metti in pausa"}
      </Button>
      <Dialog open={confermaAperta} onOpenChange={setConfermaAperta}>
        <DialogTrigger
          render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />}
          aria-label={`Rimuovi ${email}`}
        >
          <Trash2Icon aria-hidden />
          Rimuovi
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rimuovere il destinatario?</DialogTitle>
            <DialogDescription>
              {email} non riceverà più nessuna notifica. Se vuoi solo sospenderle per un po&apos;, usa «Metti in pausa».
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Annulla</DialogClose>
            <Button
              variant="destructive"
              size="lg"
              disabled={inCorso}
              onClick={() => esegui(() => eliminaDestinatario(id), `${email} rimosso`, () => setConfermaAperta(false))}
            >
              {inCorso ? "Rimozione…" : "Rimuovi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
