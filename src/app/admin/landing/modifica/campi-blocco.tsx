"use client";

import { createContext, useContext, useId } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "cn";

import { CampoImmagine } from "@/app/admin/landing/campo-immagine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNativa } from "@/components/ui/select-nativa";
import { analizzaVideo, isLinkValido } from "@/lib/landing/blocchi";
import { elementoVuoto, pulsanteNuovo, type Campo } from "@/lib/landing/editor";

type Dati = Record<string, unknown>;

/** Blocchi della pagina in modifica, per scegliere la sezione di destinazione di un pulsante. */
export const SezioniPagina = createContext<{ id: string; nome: string }[]>([]);

const azioniPulsante = [
  { valore: "acquista", etichetta: "Acquista la guida (apre il pagamento)" },
  { valore: "sezione", etichetta: "Vai a una sezione della pagina" },
  { valore: "link", etichetta: "Apri un link" },
  { valore: "accedi", etichetta: "Accedi all'area riservata" },
];

/** Pulsante configurabile: testo, azione, destinazione e stile. */
function CampoPulsante({
  campo,
  valore,
  onChange,
}: {
  campo: Extract<Campo, { tipo: "pulsante" }>;
  valore: unknown;
  onChange: (valore: unknown) => void;
}) {
  const id = useId();
  const sezioni = useContext(SezioniPagina);
  const p = pulsanteNuovo(typeof valore === "object" && valore !== null ? (valore as Dati) : {});
  // I pulsanti obbligatori (es. invito) sono sempre attivi.
  const attivo = !campo.facoltativo || p.attivo === true;
  const cambia = (chiave: string, v: unknown) => onChange({ ...p, attivo, [chiave]: v });
  const link = String(p.link ?? "");

  return (
    <fieldset className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <legend className="px-1 text-sm font-medium">{campo.etichetta}</legend>
      {campo.facoltativo && (
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={attivo}
            onChange={(e) => onChange({ ...p, attivo: e.target.checked })}
          />
          Mostra il pulsante
        </label>
      )}
      {attivo && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={`${id}-testo`} className="text-sm font-medium">
              Testo <span className="text-destructive">*</span>
            </label>
            <Input id={`${id}-testo`} value={String(p.etichetta ?? "")} onChange={(e) => cambia("etichetta", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-azione`} className="text-sm font-medium">
              Cosa fa
            </label>
            <SelectNativa id={`${id}-azione`} value={String(p.azione)} onChange={(e) => cambia("azione", e.target.value)}>
              {azioniPulsante.map((a) => (
                <option key={a.valore} value={a.valore}>
                  {a.etichetta}
                </option>
              ))}
            </SelectNativa>
          </div>
          {p.azione === "sezione" && (
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor={`${id}-sezione`} className="text-sm font-medium">
                Sezione di destinazione <span className="text-destructive">*</span>
              </label>
              <SelectNativa id={`${id}-sezione`} value={String(p.sezione ?? "")} onChange={(e) => cambia("sezione", e.target.value)}>
                <option value="">Scegli…</option>
                {sezioni.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </SelectNativa>
              {p.sezione && !sezioni.some((s) => s.id === p.sezione) && (
                <p className="text-xs text-destructive">La sezione scelta non esiste più: scegline un&apos;altra.</p>
              )}
            </div>
          )}
          {p.azione === "link" && (
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor={`${id}-link`} className="text-sm font-medium">
                Indirizzo <span className="text-destructive">*</span>
              </label>
              <Input
                id={`${id}-link`}
                value={link}
                placeholder="https://…, /pagina, mailto:… o tel:…"
                onChange={(e) => cambia("link", e.target.value.trim())}
              />
              {link && !isLinkValido(link) && (
                <p className="text-xs text-destructive">Usa un indirizzo https, un percorso che inizia con /, mailto: o tel:.</p>
              )}
              <p className="text-xs text-muted-foreground">I link esterni si aprono in una nuova scheda.</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor={`${id}-stile`} className="text-sm font-medium">
              Stile
            </label>
            <SelectNativa id={`${id}-stile`} value={String(p.stile)} onChange={(e) => cambia("stile", e.target.value)}>
              <option value="principale">Principale (pieno)</option>
              <option value="secondario">Secondario (contorno)</option>
            </SelectNativa>
          </div>
        </div>
      )}
      <Aiuto testo={campo.aiuto} />
    </fieldset>
  );
}

export const classiTextarea =
  "min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

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
    case "video":
      return (
        <div className="space-y-1.5">
          <Etichetta campo={campo} htmlFor={id} />
          <CampoImmagine idCampo={id} valore={testo} onChange={onChange} tipoFile={campo.tipo} />
          <Aiuto testo={campo.aiuto} />
          {campo.tipo === "video" && testo && !analizzaVideo(testo) && (
            <p className="text-xs text-destructive">
              Indirizzo non riconosciuto: usa un file caricato o un link di Bunny Stream, YouTube o Vimeo.
            </p>
          )}
        </div>
      );

    case "pulsante":
      return <CampoPulsante campo={campo} valore={valore} onChange={onChange} />;

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
          <SelectNativa
            id={id}
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
          </SelectNativa>
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
      {campi
        .filter((campo) => !campo.quando || campo.quando.valori.includes(dati[campo.quando.chiave]))
        .map((campo) => (
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
