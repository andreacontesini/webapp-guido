"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, EyeOffIcon, HomeIcon, SendIcon, Trash2Icon, Undo2Icon } from "lucide-react";

import {
  duplicaLanding,
  eliminaLanding,
  impostaPaginaIniziale,
  impostaPubblicazione,
  type EsitoAzione,
} from "@/app/admin/landing/azioni";
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

/** Pubblica/ritira e scelta della pagina iniziale. */
export function AzioniLanding({
  id,
  pubblicata,
  paginaIniziale,
}: {
  id: string;
  pubblicata: boolean;
  paginaIniziale: boolean;
}) {
  const { inCorso, errore, esegui } = useAzione();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {pubblicata ? (
          <Button
            variant="outline"
            size="sm"
            disabled={inCorso}
            onClick={() => esegui(() => impostaPubblicazione(id, false))}
          >
            <EyeOffIcon aria-hidden />
            Ritira
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={inCorso}
            onClick={() => esegui(() => impostaPubblicazione(id, true))}
          >
            <SendIcon aria-hidden />
            Pubblica
          </Button>
        )}

        {paginaIniziale ? (
          <Button
            variant="outline"
            size="sm"
            disabled={inCorso}
            onClick={() => esegui(() => impostaPaginaIniziale(null))}
          >
            <Undo2Icon aria-hidden />
            Torna alla pagina iniziale predefinita
          </Button>
        ) : (
          pubblicata && (
            <Button
              variant="outline"
              size="sm"
              disabled={inCorso}
              onClick={() => esegui(() => impostaPaginaIniziale(id))}
            >
              <HomeIcon aria-hidden />
              Usa come pagina iniziale
            </Button>
          )
        )}
      </div>
      {errore && (
        <p role="alert" className="text-xs text-destructive">
          {errore}
        </p>
      )}
    </div>
  );
}

/** Duplica ed elimina (con conferma). */
export function GestioneLanding({
  id,
  titolo,
  paginaIniziale,
}: {
  id: string;
  titolo: string;
  paginaIniziale: boolean;
}) {
  const router = useRouter();
  const { inCorso, errore, esegui } = useAzione();
  const [aperto, setAperto] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={inCorso}
          onClick={() => esegui(() => duplicaLanding(id), () => router.refresh())}
        >
          <CopyIcon aria-hidden />
          Duplica
        </Button>
        <Dialog open={aperto} onOpenChange={setAperto}>
          <DialogTrigger render={<Button variant="ghost" size="sm" disabled={inCorso} />}>
            <Trash2Icon aria-hidden />
            Elimina
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminare «{titolo}»?</DialogTitle>
              <DialogDescription>
                La landing e le sue statistiche vengono cancellate definitivamente e il suo
                indirizzo smette di funzionare.
                {paginaIniziale && " È la pagina iniziale: tornerà quella predefinita."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
              <Button
                variant="destructive"
                disabled={inCorso}
                onClick={() => esegui(() => eliminaLanding(id), () => setAperto(false))}
              >
                Elimina definitivamente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {errore && (
        <p role="alert" className="text-xs text-destructive">
          {errore}
        </p>
      )}
    </div>
  );
}
