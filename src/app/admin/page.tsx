import type { Metadata } from "next";
import { FileTextIcon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Panoramica",
};

const sezioni = [
  {
    titolo: "Utenti",
    descrizione: "Elenco utenti, blocco degli account e gestione dei permessi.",
    icona: UsersIcon,
  },
  {
    titolo: "Guida PDF",
    descrizione: "Caricamento della guida e aggiornamento dei suoi dettagli.",
    icona: FileTextIcon,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Panoramica
        </h1>
        <p className="text-muted-foreground">
          Gestisci utenti, permessi e contenuti dell&apos;app.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {sezioni.map(({ titolo, descrizione, icona: Icona }) => (
          <li
            key={titolo}
            className="flex flex-col rounded-xl border bg-card p-6 text-card-foreground"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icona className="size-5" aria-hidden />
              </span>
              <Badge variant="outline">Fase 4</Badge>
            </div>
            <h2 className="font-semibold">{titolo}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{descrizione}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
