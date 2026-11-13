"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { PencilIcon, PlusIcon } from "lucide-react";

import { salvaDestinatario, type StatoDestinatario } from "@/app/admin/notifiche/azioni";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { codiciEvento, eventi, gruppiEvento, type CodiceEvento } from "@/lib/notifiche/eventi";

type Props =
  | { modo: "nuovo" }
  | { modo: "modifica"; id: string; email: string; nome: string | null; eventiScelti: CodiceEvento[] };

/**
 * Popup per aggiungere un destinatario o cambiarne nome ed eventi. Un nuovo
 * destinatario parte con tutti gli eventi: per un indirizzo esterno (es. il
 * commercialista) basta lasciare solo quelli che gli servono.
 */
export function ModuloDestinatario(props: Props) {
  const id = props.modo === "modifica" ? props.id : null;
  const [aperto, setAperto] = useState(false);
  const [stato, azione, inCorso] = useActionState<StatoDestinatario, FormData>(salvaDestinatario.bind(null, id), {
    errori: {},
  });
  const iniziali = props.modo === "modifica" ? props.eventiScelti : [...codiciEvento];
  const [scelti, setScelti] = useState<Set<string>>(new Set(iniziali));
  const [statoVisto, setStatoVisto] = useState(stato);

  if (stato !== statoVisto) {
    setStatoVisto(stato);
    if (stato.salvatoIl) setAperto(false);
    else if (stato.valori) setScelti(new Set(stato.valori.eventi));
  }

  useEffect(() => {
    if (stato.salvatoIl) toast.success(id ? "Destinatario aggiornato" : "Destinatario aggiunto");
    else if (stato.erroreGenerale) toast.error(stato.erroreGenerale);
  }, [stato, id]);

  const apri = (nuovoStato: boolean) => {
    setAperto(nuovoStato);
    // A ogni apertura il modulo riparte dai valori salvati.
    if (nuovoStato) setScelti(new Set(iniziali));
  };

  const cambia = (codice: string, attivo: boolean) =>
    setScelti((precedenti) => {
      const nuovi = new Set(precedenti);
      if (attivo) nuovi.add(codice);
      else nuovi.delete(codice);
      return nuovi;
    });

  return (
    <Dialog open={aperto} onOpenChange={apri}>
      {props.modo === "nuovo" ? (
        <DialogTrigger render={<Button size="lg" />}>
          <PlusIcon aria-hidden />
          Aggiungi destinatario
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button variant="outline" size="sm" />} aria-label={`Modifica ${props.email}`}>
          <PencilIcon aria-hidden />
          Modifica
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.modo === "nuovo" ? "Nuovo destinatario" : props.email}</DialogTitle>
          <DialogDescription>
            {props.modo === "nuovo"
              ? "Può essere anche un indirizzo esterno all'app, per esempio il commercialista per i soli acquisti."
              : "Scegli quali eventi riceve questo indirizzo."}
          </DialogDescription>
        </DialogHeader>

        <form
          action={azione}
          onSubmit={(evento) => {
            evento.preventDefault();
            const dati = new FormData(evento.currentTarget);
            startTransition(() => azione(dati));
          }}
          noValidate
          className="space-y-5"
        >
          {props.modo === "nuovo" && (
            <div className="space-y-2">
              <Label htmlFor="destinatario-email">Email</Label>
              <Input
                id="destinatario-email"
                name="email"
                type="email"
                autoComplete="off"
                defaultValue={stato.valori?.email}
                aria-invalid={stato.errori.email ? true : undefined}
              />
              {stato.errori.email && (
                <p role="alert" className="text-sm text-destructive">
                  {stato.errori.email}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`destinatario-nome-${id ?? "nuovo"}`}>Nome (facoltativo)</Label>
            <Input
              id={`destinatario-nome-${id ?? "nuovo"}`}
              name="nome"
              autoComplete="off"
              placeholder="Es. Commercialista"
              defaultValue={stato.valori?.nome ?? (props.modo === "modifica" ? (props.nome ?? "") : "")}
              aria-invalid={stato.errori.nome ? true : undefined}
            />
            {stato.errori.nome && (
              <p role="alert" className="text-sm text-destructive">
                {stato.errori.nome}
              </p>
            )}
          </div>

          <fieldset className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="text-sm font-medium">Eventi da ricevere</legend>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => setScelti(new Set(codiciEvento))}
                >
                  Tutti
                </button>
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => setScelti(new Set())}
                >
                  Nessuno
                </button>
              </div>
            </div>
            {gruppiEvento.map((gruppo) => (
              <div key={gruppo} className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{gruppo}</p>
                <ul className="divide-y rounded-lg border">
                  {codiciEvento
                    .filter((codice) => eventi[codice].gruppo === gruppo)
                    .map((codice) => {
                      const idCampo = `evento-${id ?? "nuovo"}-${codice}`;
                      return (
                        <li key={codice}>
                          <label htmlFor={idCampo} className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-muted/40">
                            <input
                              id={idCampo}
                              type="checkbox"
                              name="eventi"
                              value={codice}
                              checked={scelti.has(codice)}
                              onChange={(e) => cambia(codice, e.target.checked)}
                              className="mt-0.5 size-4 shrink-0 accent-primary"
                            />
                            <span className="space-y-0.5">
                              <span className="block text-sm font-medium">
                                {eventi[codice].etichetta}
                                {eventi[codice].urgente && <span className="ml-1.5 text-xs text-destructive">urgente</span>}
                              </span>
                              <span className="block text-sm text-muted-foreground">{eventi[codice].descrizione}</span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
            {stato.errori.eventi && (
              <p role="alert" className="text-sm text-destructive">
                {stato.errori.eventi}
              </p>
            )}
          </fieldset>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Annulla</DialogClose>
            <Button type="submit" size="lg" disabled={inCorso}>
              {inCorso ? "Salvataggio…" : "Salva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
