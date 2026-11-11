import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, FileTextIcon, UsersIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Panoramica",
};

const sezioni = [
  {
    titolo: "Utenti",
    descrizione: "Elenco utenti, blocco degli account e gestione dei permessi.",
    icona: UsersIcon,
    href: "/admin/utenti",
  },
  {
    titolo: "Guida PDF",
    descrizione: "Caricamento della guida e aggiornamento dei suoi dettagli.",
    icona: FileTextIcon,
    href: "/admin/guida",
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
        {sezioni.map(({ titolo, descrizione, icona: Icona, href }) => (
          <li key={titolo}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-xl border bg-card p-6 text-card-foreground transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icona className="size-5" aria-hidden />
                </span>
                <ArrowRightIcon
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
              <h2 className="font-semibold">{titolo}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{descrizione}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
