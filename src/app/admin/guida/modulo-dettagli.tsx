"use client";

import { useActionState } from "react";

import { salvaDettagli, type StatoDettagli } from "@/app/admin/guida/azioni";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Errore({ id, testo }: { id: string; testo?: string }) {
  if (!testo) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {testo}
    </p>
  );
}

/** Titolo, descrizione e versione mostrati agli utenti nella pagina della guida. */
export function ModuloDettagli({ valoriIniziali }: { valoriIniziali: StatoDettagli["valori"] }) {
  const [stato, azione, inCorso] = useActionState(salvaDettagli, {
    errori: {},
    valori: valoriIniziali,
  });
  const { errori, valori, messaggio } = stato;

  const aria = (campo: keyof StatoDettagli["errori"]) =>
    errori[campo]
      ? { "aria-invalid": true as const, "aria-describedby": `errore-${campo}` }
      : {};

  return (
    <form key={JSON.stringify(valori)} action={azione} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="titolo">Titolo</Label>
        <Input
          id="titolo"
          name="titolo"
          defaultValue={valori.titolo}
          required
          maxLength={120}
          {...aria("titolo")}
        />
        <Errore id="errore-titolo" testo={errori.titolo} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descrizione">
          Descrizione <span className="font-normal text-muted-foreground">(facoltativa)</span>
        </Label>
        <textarea
          id="descrizione"
          name="descrizione"
          rows={3}
          maxLength={300}
          defaultValue={valori.descrizione}
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
          {...aria("descrizione")}
        />
        <Errore id="errore-descrizione" testo={errori.descrizione} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="versione">
          Versione <span className="font-normal text-muted-foreground">(facoltativa)</span>
        </Label>
        <Input
          id="versione"
          name="versione"
          placeholder="es. 1.0"
          defaultValue={valori.versione}
          maxLength={20}
          className="max-w-40"
          {...aria("versione")}
        />
        <Errore id="errore-versione" testo={errori.versione} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={inCorso}>
          {inCorso ? "Salvataggio…" : "Salva i dettagli"}
        </Button>
        {messaggio && !inCorso && (
          <p
            role={messaggio.tipo === "errore" ? "alert" : "status"}
            className={
              messaggio.tipo === "errore" ? "text-sm text-destructive" : "text-sm text-muted-foreground"
            }
          >
            {messaggio.testo}
          </p>
        )}
      </div>
    </form>
  );
}
