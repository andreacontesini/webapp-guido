"use client";

import { useId } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "cn";

import { CampoImmagine } from "@/app/admin/landing/campo-immagine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analizzaVideo } from "@/lib/landing/blocchi";
import { elementoVuoto, type Campo } from "@/lib/landing/editor";

type Dati = Record<string, unknown>;

export const classiTextarea =
  "min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const classiSelect =
  "h-10 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 [&>option]:bg-popover";

/** Sposta l'elemento `da` di un elenco nella posizione `a`. */
export function sposta<T>(elenco: T[], da: number, a: number) {
  if (a < 0 || a >= elenco.length) return elenco;
  const copia = [...elenco];
  const [elemento] = copia.splice(da, 1);
  copia.splice(a, 0, elemento);
  return copia;
}

function Etichetta({ campo, htmlFor }: { campo: Campo; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {campo.etichetta}
      {campo.obbligatorio && <span className="text-destructive"> *</span>}
    </label>
  );
}

function Aiuto({ testo }: { testo?: string }) {
  return testo ? <p className="text-xs text-muted-foreground">{testo}</p> : null;
}

/** Pulsanti su/giù/elimina per un elemento di un elenco. */
function ComandiElemento({
  indice,
  totale,
  nome,
  onSposta,
  onElimina,
}: {
  indice: number;
  totale: number;
  nome: string;
  onSposta: (a: number) => void;
  onElimina: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={indice === 0}
        onClick={() => onSposta(indice - 1)}
      >
        <ArrowUpIcon aria-hidden />
        <span className="sr-only">Sposta su {nome}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={indice === totale - 1}
        onClick={() => onSposta(indice + 1)}
      >
        <ArrowDownIcon aria-hidden />
        <span className="sr-only">Sposta giù {nome}</span>
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onElimina}>
        <Trash2Icon aria-hidden />
        <span className="sr-only">Elimina {nome}</span>
      </Button>
    </div>
  );
}

/** Un singolo campo del modulo, secondo lo schema. */
export function CampoModulo({
  campo,
  valore,
  onChange,
}: {
  campo: Campo;
  valore: unknown;
  onChange: (valore: unknown) => void;
}) {
  const id = useId();
  const testo = typeof valore === "string" ? valore : valore == null ? "" : String(valore);

  switch (campo.tipo) {
    case "testo":
    case "url":
      return (
        <div className="space-y-1.5">
          <Etichetta campo={campo} htmlFor={id} />
          <Input
            id={id}
            type={campo.tipo === "url" ? "url" : "text"}
            value={testo}
            onChange={(e) => onChange(e.target.value)}
          />
          <Aiuto testo={campo.aiuto} />
          {campo.chiave === "indirizzo" && testo && !analizzaVideo(testo) && (
            <p className="text-xs text-destructive">
              Indirizzo non riconosciuto: usa un link di Bunny Stream, YouTube, Vimeo o un file video.
            </p>
          )}
        </div>
      );

    case "testo-lungo":
      return (
        <div className="space-y-1.5">
          <Etichetta campo={campo} htmlFor={id} />
          <textarea
            id={id}
            className={classiTextarea}
            value={testo}
            onChange={(e) => onChange(e.target.value)}
          />
          <Aiuto testo={campo.aiuto} />
        </div>
      );

    case "immagine":
      return (
        <div className="space-y-1.5">
          <Etichetta campo={campo} htmlFor={id} />
          <CampoImmagine idCampo={id} valore={testo} onChange={onChange} />
          <Aiuto testo={campo.aiuto} />
        </div>
      );

    case "booleano":
      return (
        <div className="space-y-1">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={valore === true}
              onChange={(e) => onChange(e.target.checked)}
            />
            {campo.etichetta}
          </label>
          {campo.aiuto && <p className="pl-6.5 text-xs text-muted-foreground">{campo.aiuto}</p>}
        </div>
      );

    case "numero":
      return (
        <div className="space-y-1.5">
          <Etichetta campo={campo} htmlFor={id} />
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            className="max-w-40"
            min={campo.min}
            max={campo.max}
            value={testo}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <Aiuto testo={campo.aiuto} />
        </div>
      );

    case "scelta":
      return (
        <div className="space-y-1.5">
          <Etichetta campo={campo} htmlFor={id} />
          <select
            id={id}
            className={classiSelect}
            value={testo || String(campo.opzioni[0]?.valore ?? "")}
            onChange={(e) => {
              const opzione = campo.opzioni.find((o) => String(o.valore) === e.target.value);
              onChange(opzione?.valore ?? e.target.value);
            }}
          >
            {campo.opzioni.map((o) => (
              <option key={String(o.valore)} value={String(o.valore)}>
                {o.etichetta}
              </option>
            ))}
          </select>
          <Aiuto testo={campo.aiuto} />
        </div>
      );

    case "elenco-testi": {
      const voci = Array.isArray(valore) ? valore.map((v) => (typeof v === "string" ? v : "")) : [];
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{campo.etichetta}</legend>
          <Aiuto testo={campo.aiuto} />
          {voci.map((voce, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                aria-label={`${campo.etichettaElemento} ${i + 1}`}
                className={cn(classiTextarea, "min-h-16")}
                value={voce}
                onChange={(e) => onChange(voci.map((v, j) => (j === i ? e.target.value : v)))}
              />
              <ComandiElemento
                indice={i}
                totale={voci.length}
                nome={`${campo.etichettaElemento} ${i + 1}`}
                onSposta={(a) => onChange(sposta(voci, i, a))}
                onElimina={() => onChange(voci.filter((_, j) => j !== i))}
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...voci, ""])}>
            <PlusIcon aria-hidden />
            Aggiungi {campo.etichettaElemento}
          </Button>
        </fieldset>
      );
    }

    case "elenco": {
      const voci: Dati[] = Array.isArray(valore)
        ? valore.map((v) => (typeof v === "object" && v !== null ? (v as Dati) : {}))
        : [];
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{campo.etichetta}</legend>
          <Aiuto testo={campo.aiuto} />
          {voci.map((voce, i) => (
            <div key={i} className="rounded-lg border bg-muted/30 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {campo.etichettaElemento} {i + 1}
                </span>
                <ComandiElemento
                  indice={i}
                  totale={voci.length}
                  nome={`${campo.etichettaElemento} ${i + 1}`}
                  onSposta={(a) => onChange(sposta(voci, i, a))}
                  onElimina={() => onChange(voci.filter((_, j) => j !== i))}
                />
              </div>
              <CampiModulo
                campi={campo.campi}
                dati={voce}
                onChange={(nuovo) => onChange(voci.map((v, j) => (j === i ? nuovo : v)))}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...voci, elementoVuoto(campo.campi)])}
          >
            <PlusIcon aria-hidden />
            Aggiungi {campo.etichettaElemento}
          </Button>
        </fieldset>
      );
    }
  }
}

/** Tutti i campi di un blocco (o di un elemento di un elenco). */
export function CampiModulo({
  campi,
  dati,
  onChange,
}: {
  campi: Campo[];
  dati: Dati;
  onChange: (dati: Dati) => void;
}) {
  return (
    <div className="space-y-4">
      {campi.map((campo) => (
        <CampoModulo
          key={campo.chiave}
          campo={campo}
          valore={dati[campo.chiave]}
          onChange={(valore) => onChange({ ...dati, [campo.chiave]: valore })}
        />
      ))}
    </div>
  );
}
