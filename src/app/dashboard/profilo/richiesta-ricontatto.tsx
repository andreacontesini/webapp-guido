"use client";

import { startTransition, useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarCheckIcon, MessageCircleIcon } from "lucide-react";

import {
  annullaRichiestaRicontatto,
  inviaRichiestaRicontatto,
  type StatoRicontatto,
} from "@/app/dashboard/profilo/azioni-ricontatto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_NOTE_RICONTATTO,
  opzioniContatto,
  opzioniOrario,
  type StatoRichiesta,
  type ValoriRicontatto,
} from "@/lib/profilo/ricontatto";

const pillola =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg border px-3.5 py-2 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 text-muted-foreground hover:bg-muted";

const formatoData = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Rome" });

type Props = {
  stato: StatoRichiesta;
  /** Data della richiesta aperta o della gestione (ISO). */
  data: string | null;
  iniziali: ValoriRicontatto;
};

/**
 * Riquadro "Vuoi parlare con Guido?" nel profilo: il cliente chiede di essere
 * ricontattato per una consulenza, con note e preferenze di contatto (le
 * stesse dei dati personali). Gli admin ricevono subito una notifica.
 */
export function RichiestaRicontatto({ stato, data, iniziali }: Props) {
  const [esito, azione, inCorso] = useActionState<StatoRicontatto, FormData>(inviaRichiestaRicontatto, { errori: {} });
  const [annullamento, avviaAnnullamento] = useTransition();
  const [valori, setValori] = useState(iniziali);
  const [modificaAperta, setModificaAperta] = useState(false);
  const [esitoVisto, setEsitoVisto] = useState(esito);

  // Nuovo esito (aggiornamento durante il render): dopo un errore il modulo
  // tiene i valori inviati, dopo un invio riuscito si richiude.
  if (esito !== esitoVisto) {
    setEsitoVisto(esito);
    if (esito.valori) setValori(esito.valori);
    if (esito.esito) setModificaAperta(false);
  }

  useEffect(() => {
    if (esito.esito === "inviata") toast.success("Richiesta inviata: Guido ti ricontatterà al più presto");
    else if (esito.esito === "aggiornata") toast.success("Richiesta aggiornata");
    else if (esito.erroreGenerale) toast.error(esito.erroreGenerale);
  }, [esito]);

  const annulla = () =>
    avviaAnnullamento(async () => {
      const risultato = await annullaRichiestaRicontatto();
      if (risultato.erroreGenerale) toast.error(risultato.erroreGenerale);
      else if (risultato.esito === "annullata") toast.success("Richiesta annullata");
    });

  const cambia = (nome: keyof ValoriRicontatto, valore: string) => setValori((v) => ({ ...v, [nome]: valore }));
  const inAttesa = stato === "in_attesa";
  const mostraModulo = !inAttesa || modificaAperta;

  return (
    <section
      id="sezione-ricontatto"
      aria-labelledby="titolo-ricontatto"
      className="scroll-mt-24 rounded-xl border border-primary/30 bg-primary/5 p-5 text-card-foreground sm:p-6"
    >
      <header className="mb-4 flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {inAttesa ? <CalendarCheckIcon className="size-5" aria-hidden /> : <MessageCircleIcon className="size-5" aria-hidden />}
        </span>
        <div>
          <h2 id="titolo-ricontatto" className="text-lg font-semibold">
            {inAttesa ? "Guido ti ricontatterà" : "Vuoi parlare con Guido?"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {inAttesa && data
              ? `Richiesta inviata il ${formatoData.format(new Date(data))}. Puoi aggiornare note e preferenze o annullarla.`
              : "Vorresti essere ricontattato da Guido per una consulenza sulla vendita della tua casa? Lasciagli due righe."}
          </p>
          {stato === "gestita" && data && (
            <p className="mt-1 text-sm text-muted-foreground">
              Guido ha già gestito la tua ultima richiesta ({formatoData.format(new Date(data))}). Puoi inviarne una nuova.
            </p>
          )}
        </div>
      </header>

      {inAttesa && !modificaAperta && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="lg" onClick={() => setModificaAperta(true)}>
            Aggiorna la richiesta
          </Button>
          <Button variant="ghost" size="lg" onClick={annulla} disabled={annullamento}>
            {annullamento ? "Annullamento…" : "Annulla la richiesta"}
          </Button>
        </div>
      )}

      {mostraModulo && (
        <form
          action={azione}
          onSubmit={(evento) => {
            // Invio manuale: evita che React azzeri il modulo (pillole controllate).
            evento.preventDefault();
            const dati = new FormData(evento.currentTarget);
            startTransition(() => azione(dati));
          }}
          noValidate
          className="space-y-5"
        >
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Come preferisci essere contattato? <span className="text-destructive">*</span>
            </legend>
            <Pillole nome="contatto" opzioni={opzioniContatto} valore={valori.contatto} onCambia={cambia} errore={esito.errori.contatto} />
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="ricontatto-telefono">Telefono</Label>
            <Input
              id="ricontatto-telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              value={valori.telefono}
              onChange={(e) => cambia("telefono", e.target.value)}
              aria-invalid={esito.errori.telefono ? true : undefined}
              aria-describedby={esito.errori.telefono ? "ricontatto-telefono-errore" : undefined}
              className="sm:max-w-xs"
            />
            {esito.errori.telefono && (
              <p id="ricontatto-telefono-errore" role="alert" className="text-sm text-destructive">
                {esito.errori.telefono}
              </p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Quando preferisci essere contattato?</legend>
            <Pillole nome="orario" opzioni={opzioniOrario} valore={valori.orario} onCambia={cambia} errore={esito.errori.orario} />
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="ricontatto-note">Di cosa vorresti parlare?</Label>
            <textarea
              id="ricontatto-note"
              name="note"
              value={valori.note}
              maxLength={MAX_NOTE_RICONTATTO}
              onChange={(e) => cambia("note", e.target.value)}
              placeholder="Per esempio: vorrei capire se il prezzo che ho in mente è realistico."
              aria-invalid={esito.errori.note ? true : undefined}
              className="min-h-28 w-full rounded-lg border border-input bg-background px-3.5 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
            />
            {esito.errori.note && (
              <p role="alert" className="text-sm text-destructive">
                {esito.errori.note}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" disabled={inCorso}>
              {inCorso ? "Invio…" : inAttesa ? "Salva le modifiche" : "Chiedi di essere ricontattato"}
            </Button>
            {inAttesa && (
              <Button type="button" variant="ghost" size="lg" onClick={() => setModificaAperta(false)}>
                Chiudi
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Contatto preferito, orario e telefono si aggiornano anche nei tuoi dati personali.
          </p>
        </form>
      )}
    </section>
  );
}

function Pillole({
  nome,
  opzioni,
  valore,
  onCambia,
  errore,
}: {
  nome: "contatto" | "orario";
  opzioni: readonly { valore: string; etichetta: string }[];
  valore: string;
  onCambia: (nome: keyof ValoriRicontatto, valore: string) => void;
  errore?: string;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {opzioni.map((o) => (
          <span key={o.valore}>
            <input
              type="radio"
              id={`ricontatto-${nome}-${o.valore}`}
              name={nome}
              value={o.valore}
              checked={valore === o.valore}
              onChange={() => onCambia(nome, o.valore)}
              className="peer sr-only"
            />
            <label htmlFor={`ricontatto-${nome}-${o.valore}`} className={pillola}>
              {o.etichetta}
            </label>
          </span>
        ))}
        {!valore && <input type="hidden" name={nome} value="" />}
      </div>
      {errore && (
        <p role="alert" className="text-sm text-destructive">
          {errore}
        </p>
      )}
    </>
  );
}
