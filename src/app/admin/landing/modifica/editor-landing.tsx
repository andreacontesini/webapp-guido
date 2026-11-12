"use client";

import { useEffect, useId, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CopyIcon,
  EyeIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "cn";

import { salvaLanding, type EsitoSalvataggio } from "@/app/admin/landing/azioni";
import { CampiModulo, classiTextarea, sposta } from "@/app/admin/landing/modifica/campi-blocco";
import { CampoImmagine } from "@/app/admin/landing/campo-immagine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isBloccoValido, NOMI_BLOCCHI, type TipoBlocco } from "@/lib/landing/blocchi";
import {
  BLOCCHI_NUOVI,
  nuovoIdBlocco,
  ORDINE_BLOCCHI,
  SCHEMI_BLOCCHI,
} from "@/lib/landing/editor";

type Dati = Record<string, unknown>;

export type LandingDaModificare = {
  id: string;
  titolo: string;
  slug: string;
  seoTitolo: string;
  seoDescrizione: string;
  immagineAnteprima: string;
  blocchi: Dati[];
  pubblicata: boolean;
};

const tipoDi = (b: Dati) => b.tipo as TipoBlocco;

/** Breve descrizione del blocco per l'intestazione chiusa. */
function riassunto(b: Dati) {
  for (const chiave of ["titolo", "nome", "indirizzo", "alt"]) {
    const v = b[chiave];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** Editor di una landing: impostazioni, blocchi (aggiungi, modifica, riordina) e salvataggio. */
export function EditorLanding({ iniziale, base }: { iniziale: LandingDaModificare; base: string }) {
  const [impostazioni, setImpostazioni] = useState({
    titolo: iniziale.titolo,
    slug: iniziale.slug,
    seoTitolo: iniziale.seoTitolo,
    seoDescrizione: iniziale.seoDescrizione,
    immagineAnteprima: iniziale.immagineAnteprima,
  });
  const [blocchi, setBlocchi] = useState<Dati[]>(() =>
    iniziale.blocchi.map((b) => ({ ...b, id: typeof b.id === "string" ? b.id : nuovoIdBlocco(tipoDi(b)) })),
  );
  const [aperti, setAperti] = useState<Set<string>>(new Set());
  const [daAggiungere, setDaAggiungere] = useState<TipoBlocco>("testo");
  const [modificato, setModificato] = useState(false);
  const [esito, setEsito] = useState<(EsitoSalvataggio & { salvato?: boolean }) | null>(null);
  const [inCorso, avvia] = useTransition();
  const idSlug = useId();

  // Avviso se si lascia la pagina con modifiche non salvate.
  useEffect(() => {
    if (!modificato) return;
    const avvisa = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avvisa);
    return () => window.removeEventListener("beforeunload", avvisa);
  }, [modificato]);

  const cambiaBlocchi = (nuovi: Dati[]) => {
    setBlocchi(nuovi);
    setModificato(true);
  };
  const cambiaImpostazione = (chiave: keyof typeof impostazioni, valore: string) => {
    setImpostazioni((s) => ({ ...s, [chiave]: valore }));
    setModificato(true);
  };
  const apri = (id: string, aperto: boolean) =>
    setAperti((s) => {
      const nuovo = new Set(s);
      if (aperto) nuovo.add(id);
      else nuovo.delete(id);
      return nuovo;
    });

  function aggiungi() {
    const id = nuovoIdBlocco(daAggiungere);
    cambiaBlocchi([...blocchi, { id, tipo: daAggiungere, ...structuredClone(BLOCCHI_NUOVI[daAggiungere]) }]);
    apri(id, true);
    requestAnimationFrame(() =>
      document.getElementById(`blocco-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function duplica(i: number) {
    const id = nuovoIdBlocco(tipoDi(blocchi[i]));
    const copia = { ...structuredClone(blocchi[i]), id };
    cambiaBlocchi([...blocchi.slice(0, i + 1), copia, ...blocchi.slice(i + 1)]);
    apri(id, true);
  }

  function salva() {
    avvia(async () => {
      const risultato = await salvaLanding(iniziale.id, { ...impostazioni, blocchi });
      const salvato = !risultato.errore && !risultato.errori;
      setEsito({ ...risultato, salvato });
      if (salvato) setModificato(false);
    });
  }

  const erroreCampo = (chiave: keyof NonNullable<EsitoSalvataggio["errori"]>) =>
    esito?.errori?.[chiave] ? (
      <p className="text-xs text-destructive">{esito.errori[chiave]}</p>
    ) : null;

  return (
    <div className="space-y-8">
      {/* Impostazioni della pagina */}
      <section className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="font-semibold">Impostazioni</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="titolo">
              Nome interno <span className="text-destructive">*</span>
            </label>
            <Input
              id="titolo"
              value={impostazioni.titolo}
              onChange={(e) => cambiaImpostazione("titolo", e.target.value)}
            />
            {erroreCampo("titolo")}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor={idSlug}>
              Indirizzo <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center rounded-md border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
              <span className="truncate pl-3 text-sm text-muted-foreground">{base}/</span>
              <input
                id={idSlug}
                className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-base outline-none md:text-sm"
                value={impostazioni.slug}
                onChange={(e) => cambiaImpostazione("slug", e.target.value.toLowerCase())}
              />
            </div>
            {iniziale.pubblicata && impostazioni.slug !== iniziale.slug ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                La landing è pubblicata: cambiando indirizzo, i link già condivisi smetteranno di
                funzionare.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Minuscole, numeri e trattini.</p>
            )}
            {erroreCampo("slug")}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="seo-titolo">
              Titolo per Google e condivisione
            </label>
            <Input
              id="seo-titolo"
              value={impostazioni.seoTitolo}
              placeholder={impostazioni.titolo}
              onChange={(e) => cambiaImpostazione("seoTitolo", e.target.value)}
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {impostazioni.seoTitolo.length}/60 caratteri consigliati
            </p>
            {erroreCampo("seoTitolo")}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="seo-descrizione">
              Descrizione per Google e condivisione
            </label>
            <textarea
              id="seo-descrizione"
              className={cn(classiTextarea, "min-h-20")}
              value={impostazioni.seoDescrizione}
              onChange={(e) => cambiaImpostazione("seoDescrizione", e.target.value)}
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {impostazioni.seoDescrizione.length}/160 caratteri consigliati
            </p>
            {erroreCampo("seoDescrizione")}
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium">Immagine di anteprima (1200×630)</span>
            <CampoImmagine
              valore={impostazioni.immagineAnteprima}
              onChange={(url) => cambiaImpostazione("immagineAnteprima", url)}
            />
            <p className="text-xs text-muted-foreground">
              Mostrata quando il link viene condiviso. Se manca si usa quella generata dall&apos;app.
            </p>
            {erroreCampo("immagineAnteprima")}
          </div>
        </div>
      </section>

      {/* Blocchi */}
      <section className="space-y-3">
        <h2 className="font-semibold">Blocchi della pagina</h2>
        {blocchi.length === 0 && (
          <p className="rounded-xl border border-dashed p-6 text-muted-foreground">
            Nessun blocco: aggiungine uno qui sotto.
          </p>
        )}
        <ol className="space-y-3">
          {blocchi.map((blocco, i) => {
            const id = blocco.id as string;
            const tipo = tipoDi(blocco);
            const aperto = aperti.has(id);
            const valido = isBloccoValido(blocco);
            const nome = `${NOMI_BLOCCHI[tipo]} (blocco ${i + 1})`;
            return (
              <li
                key={id}
                id={`blocco-${id}`}
                className={cn(
                  "scroll-mt-20 rounded-xl border bg-card",
                  !valido && "border-amber-500/50",
                )}
              >
                <div className="flex items-center gap-2 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => apri(id, !aperto)}
                    aria-expanded={aperto}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2 font-medium">
                        {NOMI_BLOCCHI[tipo]}
                        {!valido && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                            Incompleto
                          </Badge>
                        )}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {riassunto(blocco) || "—"}
                      </span>
                    </span>
                    <ChevronDownIcon
                      className={cn("ml-auto size-4 shrink-0 transition-transform", aperto && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={i === 0}
                      onClick={() => cambiaBlocchi(sposta(blocchi, i, i - 1))}
                    >
                      <ArrowUpIcon aria-hidden />
                      <span className="sr-only">Sposta su: {nome}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={i === blocchi.length - 1}
                      onClick={() => cambiaBlocchi(sposta(blocchi, i, i + 1))}
                    >
                      <ArrowDownIcon aria-hidden />
                      <span className="sr-only">Sposta giù: {nome}</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => duplica(i)}>
                      <CopyIcon aria-hidden />
                      <span className="sr-only">Duplica: {nome}</span>
                    </Button>
                    <EliminaBlocco
                      nome={nome}
                      onElimina={() => cambiaBlocchi(blocchi.filter((_, j) => j !== i))}
                    />
                  </div>
                </div>
                {aperto && (
                  <div className="border-t p-4 sm:p-5">
                    {!valido && (
                      <p className="mb-4 flex gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                        Compila i campi con l&apos;asterisco: finché il blocco è incompleto non
                        compare nella pagina.
                      </p>
                    )}
                    <CampiModulo
                      campi={SCHEMI_BLOCCHI[tipo]}
                      dati={blocco}
                      onChange={(nuovo) => cambiaBlocchi(blocchi.map((b, j) => (j === i ? nuovo : b)))}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3">
          <label htmlFor="nuovo-blocco" className="sr-only">
            Tipo di blocco da aggiungere
          </label>
          <select
            id="nuovo-blocco"
            className="h-10 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm dark:bg-input/30 [&>option]:bg-popover"
            value={daAggiungere}
            onChange={(e) => setDaAggiungere(e.target.value as TipoBlocco)}
          >
            {ORDINE_BLOCCHI.map((tipo) => (
              <option key={tipo} value={tipo}>
                {NOMI_BLOCCHI[tipo]}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={aggiungi}>
            <PlusIcon aria-hidden />
            Aggiungi blocco
          </Button>
        </div>
      </section>

      {/* Barra di salvataggio */}
      {/* Resta visibile sopra la navigazione in basso (smartphone) o in fondo alla finestra. */}
      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 rounded-xl border bg-background/95 shadow-lg backdrop-blur lg:bottom-4">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div aria-live="polite" className="min-w-0 flex-1 text-sm">
            {modificato ? (
              <span className="text-muted-foreground">Modifiche non salvate</span>
            ) : esito?.errore ? (
              <span className="text-destructive">{esito.errore}</span>
            ) : esito?.errori ? (
              <span className="text-destructive">Controlla i campi evidenziati nelle impostazioni.</span>
            ) : esito?.salvato ? (
              <span className="flex items-center gap-1.5">
                <CircleCheckIcon className="size-4 text-primary" aria-hidden />
                Salvato
                {esito.incompleti?.length
                  ? ` · blocchi incompleti (non visibili): ${esito.incompleti.map((n) => n + 1).join(", ")}`
                  : iniziale.pubblicata
                    ? " · già online"
                    : ""}
              </span>
            ) : null}
            {modificato && esito?.errore && <span className="block text-destructive">{esito.errore}</span>}
          </div>
          <Button
            variant="outline"
            render={<Link href={`/anteprima/${iniziale.id}`} target="_blank" />}
            nativeButton={false}
            title={modificato ? "Salva per vedere le ultime modifiche" : undefined}
          >
            <EyeIcon aria-hidden />
            Anteprima
          </Button>
          <Button onClick={salva} disabled={inCorso}>
            <SaveIcon aria-hidden />
            {inCorso ? "Salvataggio…" : "Salva"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Elimina un blocco con conferma (secondo clic). */
function EliminaBlocco({ nome, onElimina }: { nome: string; onElimina: () => void }) {
  const [conferma, setConferma] = useState(false);
  useEffect(() => {
    if (!conferma) return;
    const timer = window.setTimeout(() => setConferma(false), 4000);
    return () => window.clearTimeout(timer);
  }, [conferma]);

  return conferma ? (
    <Button type="button" variant="destructive" size="sm" onClick={onElimina}>
      Conferma
    </Button>
  ) : (
    <Button type="button" variant="ghost" size="icon-sm" onClick={() => setConferma(true)}>
      <Trash2Icon aria-hidden />
      <span className="sr-only">Elimina: {nome}</span>
    </Button>
  );
}
