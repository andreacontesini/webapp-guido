"use client";

import { useActionState, useState } from "react";
import { CircleCheckIcon, UserPlusIcon } from "lucide-react";

import { creaUtente, type StatoNuovoUtente } from "@/app/admin/utenti/azioni";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const statoIniziale: StatoNuovoUtente = {
  errori: {},
  valori: {
    email: "",
    nome: "",
    cognome: "",
    telefono: "",
    guida: true,
    admin: false,
    invia: true,
  },
};

/** Pulsante "Nuovo utente" con il popup di creazione dell'account. */
export function NuovoUtente() {
  const [aperto, setAperto] = useState(false);
  // Ogni apertura parte da un modulo pulito.
  const [chiave, setChiave] = useState(0);

  return (
    <Dialog
      open={aperto}
      onOpenChange={(valore) => {
        setAperto(valore);
        if (valore) setChiave((c) => c + 1);
      }}
    >
      <DialogTrigger render={<Button size="lg" />}>
        <UserPlusIcon aria-hidden />
        Nuovo utente
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <ModuloNuovoUtente key={chiave} />
      </DialogContent>
    </Dialog>
  );
}

function ModuloNuovoUtente() {
  const [stato, azione, inCorso] = useActionState(creaUtente, statoIniziale);
  const { errori, valori, creato } = stato;

  if (creato) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleCheckIcon className="size-5 text-primary" aria-hidden />
            Utente creato
          </DialogTitle>
          <DialogDescription>
            L&apos;account <span className="font-medium text-foreground">{creato.email}</span> è
            pronto.{" "}
            {valori.invia && !creato.avviso
              ? "Gli abbiamo inviato un'email con il link per entrare."
              : "Può accedere da /accesso inserendo la sua email."}
          </DialogDescription>
        </DialogHeader>
        {creato.avviso && (
          <p role="alert" className="text-sm text-destructive">
            {creato.avviso}
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button />}>Chiudi</DialogClose>
        </DialogFooter>
      </>
    );
  }

  const aria = (campo: keyof StatoNuovoUtente["errori"]) =>
    errori[campo]
      ? { "aria-invalid": true as const, "aria-describedby": `errore-nuovo-${campo}` }
      : {};

  return (
    // `key`: dopo un errore il modulo si rimonta con i valori inviati.
    <form key={JSON.stringify(valori)} action={azione} className="space-y-5" noValidate>
      <DialogHeader>
        <DialogTitle>Nuovo utente</DialogTitle>
        <DialogDescription>
          L&apos;account nasce già confermato. Al primo accesso l&apos;utente accetta
          l&apos;informativa privacy e completa i dati mancanti.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="nuovo-email">Email</Label>
        <Input
          id="nuovo-email"
          name="email"
          type="email"
          autoComplete="off"
          defaultValue={valori.email}
          required
          autoFocus
          {...aria("email")}
        />
        <Errore id="errore-nuovo-email" testo={errori.email} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nuovo-nome">
            Nome <Facoltativo />
          </Label>
          <Input id="nuovo-nome" name="nome" autoComplete="off" defaultValue={valori.nome} {...aria("nome")} />
          <Errore id="errore-nuovo-nome" testo={errori.nome} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nuovo-cognome">
            Cognome <Facoltativo />
          </Label>
          <Input
            id="nuovo-cognome"
            name="cognome"
            autoComplete="off"
            defaultValue={valori.cognome}
            {...aria("cognome")}
          />
          <Errore id="errore-nuovo-cognome" testo={errori.cognome} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nuovo-telefono">
          Telefono <Facoltativo />
        </Label>
        <Input
          id="nuovo-telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          defaultValue={valori.telefono}
          {...aria("telefono")}
        />
        <Errore id="errore-nuovo-telefono" testo={errori.telefono} />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <Label className="items-start font-normal leading-snug">
          <Checkbox name="guida" defaultChecked={valori.guida} className="mt-0.5" />
          <span>Assegna subito l&apos;accesso alla guida</span>
        </Label>
        <Label className="items-start font-normal leading-snug">
          <Checkbox name="admin" defaultChecked={valori.admin} className="mt-0.5" />
          <span>Amministratore (accesso al back office)</span>
        </Label>
        <Label className="items-start font-normal leading-snug">
          <Checkbox name="invia" defaultChecked={valori.invia} className="mt-0.5" />
          <span>Invia un&apos;email con il link per entrare</span>
        </Label>
      </div>

      {stato.erroreGenerale && (
        <p role="alert" className="text-sm text-destructive">
          {stato.erroreGenerale}
        </p>
      )}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Annulla</DialogClose>
        <Button type="submit" disabled={inCorso}>
          {inCorso ? "Creazione…" : "Crea utente"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Facoltativo() {
  return <span className="font-normal text-muted-foreground">(facoltativo)</span>;
}

function Errore({ id, testo }: { id: string; testo?: string }) {
  if (!testo) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {testo}
    </p>
  );
}
