"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";

import { salvaSezione, type StatoSezione } from "@/app/dashboard/profilo/azioni";
import { CampoProfilo } from "@/app/dashboard/profilo/campo-profilo";
import { Button } from "@/components/ui/button";
import { isVisibile, sezionePerId, type IdSezione } from "@/lib/profilo/campi";
import { riepilogoErrori, unisciInviati } from "@/lib/profilo/validazione";

export function SezioneProfilo({ idSezione, iniziali, completa }: { idSezione: IdSezione; iniziali: Record<string, string>; completa: boolean }) {
  const sezione = sezionePerId(idSezione)!;
  const [stato, azione, inCorso] = useActionState<StatoSezione, FormData>(salvaSezione.bind(null, idSezione), { errori: {} });
  const [valori, setValori] = useState(iniziali);
  const [modificato, setModificato] = useState(false);
  const [statoVisto, setStatoVisto] = useState(stato);

  // Nuovo esito dell'azione (aggiornamento durante il render, senza effetti):
  // dopo un errore il modulo mostra i valori inviati, dopo un salvataggio
  // riparte "pulito" per mostrare "Salvato".
  if (stato !== statoVisto) {
    setStatoVisto(stato);
    const inviati = stato.inviati;
    if (inviati) setValori((precedenti) => unisciInviati(sezione, precedenti, inviati));
    if (stato.salvatoIl) setModificato(false);
  }
  const salvato = stato.salvatoIl && !modificato ? new Date(stato.salvatoIl) : null;
  const erroriCampi = riepilogoErrori(sezione, stato.errori);
  const modulo = useRef<HTMLFormElement>(null);

  // Esito del salvataggio: notifica a comparsa e, se ci sono errori, la pagina
  // scorre al primo campo da correggere (che può essere lontano da "Salva").
  useEffect(() => {
    if (stato.salvatoIl) {
      toast.success(`${sezione.titolo}: salvato`);
      return;
    }
    if (stato.erroreGenerale) {
      toast.error(stato.erroreGenerale);
      return;
    }
    const primo = sezione.campi.find((c) => stato.errori[c.nome]);
    if (!primo) return;
    toast.error(`${sezione.titolo}: non salvato`, { description: riepilogoErrori(sezione, stato.errori) });
    const campo = modulo.current?.querySelector<HTMLElement>(`[name="${primo.nome}"]:not([type="hidden"])`);
    campo?.scrollIntoView({ behavior: "smooth", block: "center" });
    campo?.focus({ preventScroll: true });
  }, [stato, sezione]);

  const cambia = (nome: string, valore: string) => {
    setValori((v) => ({ ...v, [nome]: valore }));
    setModificato(true);
  };

  return (
    <section id={`sezione-${sezione.id}`} aria-labelledby={`titolo-${sezione.id}`} className="scroll-mt-24 rounded-xl border bg-card p-5 text-card-foreground sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 id={`titolo-${sezione.id}`} className="text-lg font-semibold">{sezione.titolo}</h2>
          <p className="text-sm text-muted-foreground">{sezione.descrizione}</p>
        </div>
        {sezione.contaNelCompletamento && completa && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <CheckIcon className="size-3.5" aria-hidden /> Completa
          </span>
        )}
      </header>
      <form
        ref={modulo}
        action={azione}
        // Invio manuale: con `action` da solo React azzera il modulo dopo ogni
        // invio e select e pulsanti di scelta (controllati) tornerebbero ai
        // valori iniziali nel DOM, poi riscritti al salvataggio successivo.
        // `action` resta per chi usa la pagina senza JavaScript.
        onSubmit={(evento) => {
          evento.preventDefault();
          const dati = new FormData(evento.currentTarget);
          startTransition(() => azione(dati));
        }}
        noValidate
        className="space-y-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {sezione.campi.filter((c) => isVisibile(c, valori)).map((campo) => (
            <CampoProfilo key={campo.nome} campo={campo} valore={valori[campo.nome] ?? ""} valori={valori} errore={stato.errori[campo.nome]} onCambia={cambia} />
          ))}
        </div>
        {(stato.erroreGenerale || erroriCampi) && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {stato.erroreGenerale ?? `Non salvato. ${erroriCampi}`}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={inCorso}>{inCorso ? "Salvataggio…" : "Salva"}</Button>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {salvato && (
              <span className="inline-flex items-center gap-1">
                <CheckIcon className="size-4 text-primary" aria-hidden /> Salvato alle{" "}
                {salvato.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
      </form>
    </section>
  );
}
