"use client";

import { useActionState } from "react";
import { MailCheckIcon } from "lucide-react";

import { inviaMagicLink, type StatoAccesso } from "@/app/accesso/azioni";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statoIniziale: StatoAccesso = { esito: "iniziale" };

export function ModuloAccesso({ prossimo }: { prossimo: string }) {
  const [stato, azione, inCorso] = useActionState(inviaMagicLink, statoIniziale);

  if (stato.esito === "inviato") {
    return (
      <div role="status" className="rounded-xl border bg-card p-6 text-card-foreground">
        <span className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <MailCheckIcon className="size-5" aria-hidden />
        </span>
        <h2 className="font-semibold">Controlla la tua email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Abbiamo inviato un link di accesso a{" "}
          <span className="font-medium text-foreground">{stato.email}</span>.
          Aprilo da questo dispositivo per entrare. Se non lo trovi, guarda
          anche nella cartella spam.
        </p>
      </div>
    );
  }

  const errore = stato.esito === "errore" ? stato : null;

  return (
    <form action={azione} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={prossimo} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nome@esempio.it"
          defaultValue={errore?.email}
          aria-invalid={errore ? true : undefined}
          aria-describedby={errore ? "errore-email" : undefined}
          required
        />
        {errore && (
          <p id="errore-email" className="text-sm text-destructive">
            {errore.messaggio}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={inCorso}>
        {inCorso ? "Invio in corso…" : "Inviami il link di accesso"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Niente password: ricevi un link valido per un solo accesso. Se non hai
        ancora un account, lo creiamo noi.
      </p>
    </form>
  );
}
