"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CircleCheckIcon, LoaderIcon, SendIcon } from "lucide-react";

import { inviaRichiestaLanding, type StatoRichiestaLanding } from "@/components/landing/azione-modulo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CampoContatto } from "@/lib/landing/blocchi";

type CampoModulo = { campo: CampoContatto; etichetta: string; obbligatorio: boolean };

const attributi: Record<
  Exclude<CampoContatto, "messaggio">,
  { type: string; autoComplete: string; inputMode?: "email" | "tel" }
> = {
  nome: { type: "text", autoComplete: "name" },
  email: { type: "email", autoComplete: "email", inputMode: "email" },
  telefono: { type: "tel", autoComplete: "tel", inputMode: "tel" },
  citta: { type: "text", autoComplete: "address-level2" },
};

const classiTextarea =
  "min-h-28 w-full rounded-lg border border-input bg-transparent px-3.5 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30";

/**
 * Modulo di contatto di una landing. I campi arrivano dalla configurazione
 * del blocco; il server la rilegge dal database e non si fida di quello che
 * arriva dal browser. In anteprima non invia nulla.
 */
export function ModuloContatto({
  landingId,
  bloccoId,
  campi,
  etichettaInvio,
  messaggioConferma,
  anteprima,
}: {
  landingId: string;
  bloccoId: string;
  campi: CampoModulo[];
  etichettaInvio: string;
  messaggioConferma: string;
  anteprima: boolean;
}) {
  const [stato, azione, inCorso] = useActionState<StatoRichiestaLanding, FormData>(inviaRichiestaLanding, {
    errori: {},
  });
  // Momento di apertura del modulo: chi invia in meno di 2 secondi è quasi sempre un programma.
  const [apertoIl] = useState(() => Date.now());

  if (stato.inviata) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-8 text-center">
        <CircleCheckIcon className="size-10 text-primary" aria-hidden />
        <p className="text-lg font-medium text-pretty">{messaggioConferma}</p>
      </div>
    );
  }

  const valore = (campo: string) => stato.valori?.[campo] ?? "";
  const errore = (campo: string) =>
    stato.errori[campo] ? (
      <p id={`errore-${bloccoId}-${campo}`} role="alert" className="text-sm text-destructive">
        {stato.errori[campo]}
      </p>
    ) : null;
  const aria = (campo: string) => ({
    "aria-invalid": stato.errori[campo] ? (true as const) : undefined,
    "aria-describedby": stato.errori[campo] ? `errore-${bloccoId}-${campo}` : undefined,
  });

  return (
    <form action={azione} noValidate className="space-y-5">
      <input type="hidden" name="landing" value={landingId} />
      <input type="hidden" name="blocco" value={bloccoId} />
      <input type="hidden" name="aperto" value={apertoIl} />
      {/* Campo trappola: invisibile alle persone, compilato solo dai programmi automatici. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`sito-${bloccoId}`}>Sito web</label>
        <input id={`sito-${bloccoId}`} name="sito" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {campi.map(({ campo, etichetta, obbligatorio }) => {
        const id = `${bloccoId}-${campo}`;
        return (
          <div key={campo} className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium">
              {etichetta}
              {obbligatorio && <span className="text-destructive"> *</span>}
            </label>
            {campo === "messaggio" ? (
              <textarea
                id={id}
                name={campo}
                maxLength={2000}
                defaultValue={valore(campo)}
                className={classiTextarea}
                {...aria(campo)}
              />
            ) : (
              <Input
                id={id}
                name={campo}
                type={attributi[campo].type}
                autoComplete={attributi[campo].autoComplete}
                inputMode={attributi[campo].inputMode}
                defaultValue={valore(campo)}
                {...aria(campo)}
              />
            )}
            {errore(campo)}
          </div>
        );
      })}

      <div className="space-y-2">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="privacy"
            value="si"
            defaultChecked={stato.valori?.privacy === "si"}
            className="mt-0.5 size-4 shrink-0 accent-primary"
            {...aria("privacy")}
          />
          <span>
            Ho letto l&apos;
            <Link href="/privacy" target="_blank" className="font-medium text-foreground underline underline-offset-4">
              informativa privacy
            </Link>{" "}
            e acconsento al trattamento dei miei dati per essere ricontattato.
            <span className="text-destructive"> *</span>
          </span>
        </label>
        {errore("privacy")}
      </div>

      {stato.erroreGenerale && (
        <p role="alert" className="text-sm text-destructive">
          {stato.erroreGenerale}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={inCorso || anteprima}>
        {inCorso ? <LoaderIcon className="animate-spin" aria-hidden /> : <SendIcon aria-hidden />}
        {inCorso ? "Invio…" : etichettaInvio}
      </Button>
      {anteprima && (
        <p className="text-center text-xs text-muted-foreground">Anteprima: il modulo non invia richieste.</p>
      )}
    </form>
  );
}
