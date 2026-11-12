"use client";

import type { Campo } from "@/lib/profilo/campi";
import { documenti, risposteDocumento } from "@/lib/profilo/campi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativa } from "@/components/ui/select-nativa";
import { cn } from "@/lib/utils";

type Props = { campo: Campo; valore: string; valori: Record<string, string>; errore?: string; onCambia: (nome: string, valore: string) => void };

const pillola =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg border px-3.5 py-2 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 text-muted-foreground hover:bg-muted";

function Pillole({ nome, opzioni, valore, onCambia, descritto }: { nome: string; opzioni: { valore: string; etichetta: string }[]; valore: string; onCambia: Props["onCambia"]; descritto?: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-describedby={descritto}>
      {opzioni.map((o) => (
        <span key={o.valore}>
          <input type="radio" id={`${nome}-${o.valore}`} name={nome} value={o.valore} checked={valore === o.valore} onChange={() => onCambia(nome, o.valore)} className="peer sr-only" />
          <label htmlFor={`${nome}-${o.valore}`} className={pillola}>{o.etichetta}</label>
        </span>
      ))}
      {valore && (
        <button type="button" onClick={() => onCambia(nome, "")} className="px-1 text-sm text-muted-foreground underline-offset-4 hover:underline">
          Cancella
        </button>
      )}
      {/* Con nessuna scelta il campo arriva vuoto al server. */}
      {!valore && <input type="hidden" name={nome} value="" />}
    </div>
  );
}

export function CampoProfilo({ campo, valore, valori, errore, onCambia }: Props) {
  const id = `campo-${campo.nome}`;
  const idAiuto = campo.aiuto ? `${id}-aiuto` : undefined;
  const idErrore = errore ? `${id}-errore` : undefined;
  const descritto = [idAiuto, idErrore].filter(Boolean).join(" ") || undefined;
  const aria = { "aria-invalid": errore ? (true as const) : undefined, "aria-describedby": descritto };
  const etichetta = (
    <>
      {campo.etichetta}
      {campo.obbligatorio && <span className="text-destructive"> *</span>}
    </>
  );
  const aiuto = campo.aiuto && <p id={idAiuto} className="text-sm text-muted-foreground">{campo.aiuto}</p>;
  const messaggio = errore && <p id={idErrore} role="alert" className="text-sm text-destructive">{errore}</p>;

  if (campo.tipo === "documenti") {
    return (
      <fieldset className="space-y-3 sm:col-span-2">
        <legend className="text-sm font-medium">{campo.etichetta}</legend>
        {aiuto}
        <ul className="divide-y rounded-lg border">
          {documenti.map((d) => (
            <li key={d.codice} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm">{d.etichetta}</span>
              <Pillole nome={`documents.${d.codice}`} opzioni={risposteDocumento} valore={valori[`documents.${d.codice}`] ?? ""} onCambia={onCambia} />
            </li>
          ))}
        </ul>
        {messaggio}
      </fieldset>
    );
  }

  if (campo.tipo === "sino" || (campo.tipo === "scelta" && campo.opzioni.length <= 4)) {
    const opzioni = campo.tipo === "sino" ? [{ valore: "si", etichetta: "Sì" }, { valore: "no", etichetta: "No" }] : [...campo.opzioni];
    return (
      <fieldset className="space-y-2 sm:col-span-2">
        <legend className="text-sm font-medium">{etichetta}</legend>
        {aiuto}
        <Pillole nome={campo.nome} opzioni={opzioni} valore={valore} onCambia={onCambia} descritto={descritto} />
        {messaggio}
      </fieldset>
    );
  }

  const largo = campo.tipo === "testo" && (campo.multilinea || campo.max > 80);
  return (
    <div className={cn("space-y-2", largo && "sm:col-span-2")}>
      <Label htmlFor={id}>{etichetta}</Label>
      {campo.tipo === "scelta" ? (
        <SelectNativa id={id} name={campo.nome} value={valore} onChange={(e) => onCambia(campo.nome, e.target.value)} {...aria}>
          <option value="">Scegli…</option>
          {campo.opzioni.map((o) => <option key={o.valore} value={o.valore}>{o.etichetta}</option>)}
        </SelectNativa>
      ) : campo.tipo === "testo" && campo.multilinea ? (
        <textarea id={id} name={campo.nome} value={valore} maxLength={campo.max} onChange={(e) => onCambia(campo.nome, e.target.value)} {...aria}
          className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3.5 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30" />
      ) : (
        <div className="relative">
          <Input id={id} name={campo.nome} value={valore} onChange={(e) => onCambia(campo.nome, e.target.value)} {...aria}
            type={campo.tipo === "data" ? "date" : "text"}
            inputMode={campo.tipo === "intero" ? "numeric" : undefined}
            autoComplete={campo.tipo === "testo" ? (campo.autocomplete ?? "off") : "off"}
            className={campo.tipo === "intero" && campo.unita ? "pr-12" : undefined} />
          {campo.tipo === "intero" && campo.unita && (
            <span aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted-foreground">{campo.unita}</span>
          )}
        </div>
      )}
      {aiuto}
      {messaggio}
    </div>
  );
}
