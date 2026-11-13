import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, BellIcon, FileTextIcon, MegaphoneIcon, PhoneCallIcon, UsersIcon } from "lucide-react";

import { richiediAdmin } from "@/lib/auth/admin";
import { statoRichiesta } from "@/lib/profilo/ricontatto";
import { creaClientServer } from "@/lib/supabase/server";

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
  {
    titolo: "Landing",
    descrizione: "Pagine di vendita pubbliche e scelta della pagina iniziale.",
    icona: MegaphoneIcon,
    href: "/admin/landing",
  },
  {
    titolo: "Notifiche",
    descrizione: "Chi riceve via email gli eventi dell'app e storico degli invii.",
    icona: BellIcon,
    href: "/admin/notifiche",
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

      <Suspense fallback={null}>
        <AvvisoRicontatti />
      </Suspense>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

/** Clienti che hanno chiesto di essere ricontattati e non sono ancora stati gestiti. */
async function AvvisoRicontatti() {
  await richiediAdmin();
  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("profiles")
    .select("contact_request_at, contact_request_handled_at")
    .not("contact_request_at", "is", null);
  const quanti = (data ?? []).filter((r) => statoRichiesta(r) === "in_attesa").length;
  if (quanti === 0) return null;

  return (
    <Link
      href="/admin/utenti?ricontatto=1"
      className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm font-medium hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <PhoneCallIcon className="size-4" aria-hidden />
      </span>
      {quanti === 1 ? "1 cliente chiede di essere ricontattato" : `${quanti} clienti chiedono di essere ricontattati`}
      <ArrowRightIcon className="ml-auto size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}
