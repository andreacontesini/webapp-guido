"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PhoneCallIcon } from "lucide-react";

import { segnaRicontattoGestito } from "@/app/admin/utenti/azioni";
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
import { opzioniContatto, opzioniOrario } from "@/lib/profilo/ricontatto";

export type DatiRicontattoAdmin = {
  richiestaIl: string;
  note: string | null;
  telefono: string | null;
  contatto: string | null;
  orario: string | null;
};

const formatoData = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Rome" });
const etichetta = (opzioni: readonly { valore: string; etichetta: string }[], valore: string | null) =>
  valore ? (opzioni.find((o) => o.valore === valore)?.etichetta ?? valore) : null;

/**
 * Richiesta di ricontatto ancora aperta, evidenziata nella tabella utenti:
 * il pulsante apre i dettagli (note, preferenze, telefono) e permette di
 * segnarla come gestita.
 */
export function RicontattoUtente({ id, nome, email, dati }: { id: string; nome: string; email: string; dati: DatiRicontattoAdmin }) {
  const [aperto, setAperto] = useState(false);
  const [inCorso, avvia] = useTransition();

  const gestisci = () =>
    avvia(async () => {
      const esito = await segnaRicontattoGestito(id);
      if (esito.errore) {
        toast.error(esito.errore);
        return;
      }
      toast.success(`Richiesta di ${nome} segnata come gestita`);
      setAperto(false);
    });

  const righe = [
    { etichetta: "Richiesta inviata il", valore: formatoData.format(new Date(dati.richiestaIl)) },
    { etichetta: "Contatto preferito", valore: etichetta(opzioniContatto, dati.contatto) },
    { etichetta: "Orario preferito", valore: etichetta(opzioniOrario, dati.orario) },
    { etichetta: "Telefono", valore: dati.telefono },
    { etichetta: "Email", valore: email },
    { etichetta: "Note", valore: dati.note },
  ];

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger render={<Button size="sm" className="h-auto gap-1.5 py-1" />}>
        <PhoneCallIcon aria-hidden />
        Da ricontattare
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Richiesta di ricontatto</DialogTitle>
          <DialogDescription>{nome} vorrebbe essere ricontattato da Guido per una consulenza.</DialogDescription>
        </DialogHeader>
        <dl className="divide-y rounded-lg border text-sm">
          {righe.map(({ etichetta, valore }) => (
            <div key={etichetta} className="grid gap-1 px-3 py-2 sm:grid-cols-[10rem_1fr] sm:gap-3">
              <dt className="text-muted-foreground">{etichetta}</dt>
              <dd className={valore ? "break-words whitespace-pre-line" : "text-muted-foreground"}>{valore ?? "—"}</dd>
            </div>
          ))}
        </dl>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Chiudi</DialogClose>
          <Button size="lg" onClick={gestisci} disabled={inCorso}>
            {inCorso ? "Salvataggio…" : "Segna come gestita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
