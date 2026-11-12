"use client";

import { useActionState } from "react";
import { DownloadIcon, Trash2Icon } from "lucide-react";

import { eliminaAccount, type StatoEliminazione } from "@/app/dashboard/profilo/azioni";
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
import { PAROLA_CONFERMA } from "@/lib/profilo/account";

/** Diritti GDPR dal profilo: scaricare i propri dati ed eliminare l'account. */
export function DatiAccount({ admin }: { admin: boolean }) {
  const [stato, azione, inCorso] = useActionState<StatoEliminazione, FormData>(eliminaAccount, {});

  return (
    <section
      id="sezione-account"
      aria-labelledby="titolo-account"
      className="scroll-mt-24 rounded-xl border bg-card p-5 text-card-foreground sm:p-6"
    >
      <h2 id="titolo-account" className="text-lg font-semibold">
        I tuoi dati e il tuo account
      </h2>
      <p className="text-sm text-muted-foreground">
        Puoi scaricare una copia dei tuoi dati o eliminare l&apos;account in qualsiasi momento.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {/* Link classico: il file si scarica senza passare dal router. */}
        <Button variant="outline" size="lg" render={<a href="/dashboard/profilo/miei-dati.json" download />} nativeButton={false}>
          <DownloadIcon aria-hidden />
          Scarica i tuoi dati
        </Button>

        {admin ? (
          <p className="text-sm text-muted-foreground sm:self-center">
            Gli account amministratore non si eliminano da qui.
          </p>
        ) : (
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" size="lg" />}>
              <Trash2Icon aria-hidden />
              Elimina account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminare l&apos;account?</DialogTitle>
                <DialogDescription>L&apos;operazione è definitiva e non si può annullare.</DialogDescription>
              </DialogHeader>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Cancelliamo il tuo account, i dati del profilo e quelli della tua casa.</li>
                <li>Perdi l&apos;accesso alla guida e a eventuali altri acquisti.</li>
                <li>Conserviamo solo i dati degli acquisti richiesti dalla legge fiscale.</li>
              </ul>
              <form action={azione} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conferma-eliminazione">
                    Per confermare scrivi <span className="font-semibold">{PAROLA_CONFERMA}</span>
                  </Label>
                  <Input
                    id="conferma-eliminazione"
                    name="conferma"
                    autoComplete="off"
                    autoCapitalize="characters"
                    aria-invalid={stato.errore ? true : undefined}
                    aria-describedby={stato.errore ? "errore-eliminazione" : undefined}
                  />
                  {stato.errore && (
                    <p id="errore-eliminazione" role="alert" className="text-sm text-destructive">
                      {stato.errore}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Annulla</DialogClose>
                  <Button type="submit" variant="destructive" size="lg" disabled={inCorso}>
                    {inCorso ? "Eliminazione…" : "Elimina definitivamente"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
}
