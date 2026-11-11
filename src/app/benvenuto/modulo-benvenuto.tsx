"use client";

import { useActionState } from "react";

import { salvaDatiIniziali, type StatoBenvenuto } from "@/app/benvenuto/azioni";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statoIniziale: StatoBenvenuto = {
  errori: {},
  valori: { nome: "", cognome: "", telefono: "", marketing: false },
};

const urlPrivacy = process.env.NEXT_PUBLIC_PRIVACY_URL;

function Errore({ id, testo }: { id: string; testo?: string }) {
  if (!testo) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {testo}
    </p>
  );
}

export function ModuloBenvenuto() {
  const [stato, azione, inCorso] = useActionState(salvaDatiIniziali, statoIniziale);
  const { errori, valori } = stato;

  /** Attributi di accessibilità per un campo con eventuale errore. */
  const aria = (campo: keyof StatoBenvenuto["errori"]) =>
    errori[campo]
      ? { "aria-invalid": true as const, "aria-describedby": `errore-${campo}` }
      : {};

  return (
    // `key`: dopo un errore il modulo si rimonta con i valori inviati.
    <form key={JSON.stringify(valori)} action={azione} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            autoComplete="given-name"
            defaultValue={valori.nome}
            required
            {...aria("nome")}
          />
          <Errore id="errore-nome" testo={errori.nome} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cognome">Cognome</Label>
          <Input
            id="cognome"
            name="cognome"
            autoComplete="family-name"
            defaultValue={valori.cognome}
            required
            {...aria("cognome")}
          />
          <Errore id="errore-cognome" testo={errori.cognome} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">
          Telefono <span className="font-normal text-muted-foreground">(facoltativo)</span>
        </Label>
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={valori.telefono}
          {...aria("telefono")}
        />
        <Errore id="errore-telefono" testo={errori.telefono} />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="space-y-1">
          <Label className="items-start font-normal leading-snug">
            <Checkbox name="privacy" className="mt-0.5" {...aria("privacy")} />
            <span>
              Ho letto l&apos;
              {urlPrivacy ? (
                <a
                  href={urlPrivacy}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  informativa privacy
                </a>
              ) : (
                "informativa privacy"
              )}{" "}
              e acconsento al trattamento dei miei dati per l&apos;uso del
              servizio.
            </span>
          </Label>
          <Errore id="errore-privacy" testo={errori.privacy} />
        </div>
        <Label className="items-start font-normal leading-snug">
          <Checkbox name="marketing" defaultChecked={valori.marketing} className="mt-0.5" />
          <span>
            Voglio ricevere via email consigli e novità sulla vendita della casa
            (facoltativo).
          </span>
        </Label>
      </div>

      {stato.erroreGenerale && (
        <p role="alert" className="text-sm text-destructive">
          {stato.erroreGenerale}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={inCorso}>
        {inCorso ? "Salvataggio…" : "Entra nella tua area"}
      </Button>
    </form>
  );
}
