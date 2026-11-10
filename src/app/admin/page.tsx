import type { Metadata } from "next";
import { FileTextIcon, UsersIcon } from "lucide-react";

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
    <div className="space-y-10">
      <header className="max-w-[40rem] space-y-2">
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
            className="flex gap-4 rounded-xl bg-card p-6 ring-1 ring-border"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icona className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-medium">{titolo}</h2>
              <p className="mt-1 text-muted-foreground">{descrizione}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Disponibile nella Fase 4.
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
