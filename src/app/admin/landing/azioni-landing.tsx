"use client";

import { useState, useTransition } from "react";
import { EyeOffIcon, HomeIcon, SendIcon, Undo2Icon } from "lucide-react";

import {
  impostaPaginaIniziale,
  impostaPubblicazione,
  type EsitoAzione,
} from "@/app/admin/landing/azioni";
import { Button } from "@/components/ui/button";

/** Pulsanti di una riga dell'elenco landing: pubblica/ritira e pagina iniziale. */
export function AzioniLanding({
  id,
  pubblicata,
  paginaIniziale,
}: {
  id: string;
  pubblicata: boolean;
  paginaIniziale: boolean;
}) {
  const [inCorso, avvia] = useTransition();
  const [errore, setErrore] = useState<string>();

  const esegui = (azione: () => Promise<EsitoAzione>) =>
    avvia(async () => {
      setErrore(undefined);
      const esito = await azione();
      if (esito.errore) setErrore(esito.errore);
    });

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
