"use client";

import { useState, useTransition } from "react";
import {
  BanIcon,
  CircleCheckIcon,
  ShieldIcon,
  ShieldOffIcon,
  Trash2Icon,
} from "lucide-react";

import {
  eliminaUtente,
  impostaAccessoGuida,
  impostaBlocco,
  impostaRuolo,
  type EsitoAzione,
} from "@/app/admin/utenti/azioni";
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
import type { RuoloUtente } from "@/lib/supabase/tipi";

/** Esegue un'azione del server tenendo traccia di attesa ed eventuale errore. */
function useAzione() {
  const [inCorso, avvia] = useTransition();
  const [errore, setErrore] = useState<string>();
  const esegui = (azione: () => Promise<EsitoAzione>, dopo?: () => void) =>
    avvia(async () => {
      setErrore(undefined);
      const esito = await azione();
      if (esito.errore) setErrore(esito.errore);
      else dopo?.();
    });
  return { inCorso, errore, esegui };
}

function Errore({ testo }: { testo?: string }) {
  if (!testo) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {testo}
    </p>
  );
}

/** Interruttore per assegnare o revocare la guida. */
export function InterruttoreGuida({ id, attivo }: { id: string; attivo: boolean }) {
  const { inCorso, errore, esegui } = useAzione();
  return (
    <div className="space-y-1">
      <button
        type="button"
        role="switch"
        aria-checked={attivo}
        aria-label={attivo ? "Revoca l'accesso alla guida" : "Assegna l'accesso alla guida"}
        disabled={inCorso}
        onClick={() => esegui(() => impostaAccessoGuida(id, !attivo))}
        className="group inline-flex items-center gap-2 rounded-md text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
      >
        <span
          aria-hidden
          className="relative inline-flex h-5 w-9 shrink-0 rounded-full bg-input transition-colors group-aria-checked:bg-primary"
        >
          <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow transition-transform group-aria-checked:translate-x-4" />
        </span>
        <span className={attivo ? "text-foreground" : "text-muted-foreground"}>
          {attivo ? "Attiva" : "No"}
        </span>
      </button>
      <Errore testo={errore} />
    </div>
  );
}

/** Blocco, ruolo ed eliminazione dell'account. */
export function AzioniUtente({
  id,
  nome,
  bloccato,
  ruolo,
  seiTu,
}: {
  id: string;
  nome: string;
  bloccato: boolean;
  ruolo: RuoloUtente;
  seiTu: boolean;
}) {
  const { inCorso, errore, esegui } = useAzione();
  const [confermaAperta, setConfermaAperta] = useState(false);

  if (seiTu) {
    return <p className="text-xs text-muted-foreground">Il tuo account</p>;
  }

  const admin = ruolo === "admin";

  return (
    <div className="space-y-1">
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={inCorso}
          title={bloccato ? "Sblocca account" : "Blocca account"}
          aria-label={`${bloccato ? "Sblocca" : "Blocca"} ${nome}`}
          onClick={() => esegui(() => impostaBlocco(id, !bloccato))}
        >
          {bloccato ? <CircleCheckIcon aria-hidden /> : <BanIcon aria-hidden />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={inCorso}
          title={admin ? "Rimuovi ruolo admin" : "Rendi admin"}
          aria-label={`${admin ? "Rimuovi ruolo admin a" : "Rendi admin"} ${nome}`}
          onClick={() => esegui(() => impostaRuolo(id, admin ? "cliente" : "admin"))}
        >
          {admin ? <ShieldOffIcon aria-hidden /> : <ShieldIcon aria-hidden />}
        </Button>

        <Dialog open={confermaAperta} onOpenChange={setConfermaAperta}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                disabled={inCorso}
                title="Elimina account"
                aria-label={`Elimina ${nome}`}
                className="text-destructive hover:text-destructive"
              />
            }
          >
            <Trash2Icon aria-hidden />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminare l&apos;account?</DialogTitle>
              <DialogDescription>
                L&apos;account di <span className="font-medium text-foreground">{nome}</span> e
                i suoi dati verranno cancellati definitivamente. L&apos;operazione non si può
                annullare.
              </DialogDescription>
            </DialogHeader>
            <Errore testo={errore} />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
              <Button
                variant="destructive"
                disabled={inCorso}
                onClick={() => esegui(() => eliminaUtente(id), () => setConfermaAperta(false))}
              >
                {inCorso ? "Eliminazione…" : "Elimina definitivamente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {!confermaAperta && <Errore testo={errore} />}
    </div>
  );
}
