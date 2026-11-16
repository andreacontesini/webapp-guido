import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Intestazione, PiePagina } from "@/components/landing/pagina-landing";
import { AGGIORNAMENTO_PAGINE_LEGALI, venditore } from "@/lib/legale/venditore";

/**
 * Struttura delle pagine legali (condizioni, privacy, cookie): stessa
 * intestazione e piè di pagina delle landing, testo a misura di lettura.
 */
export function PaginaLegale({ titolo, introduzione, children }: { titolo: string; introduzione: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Intestazione />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            <ArrowLeftIcon className="size-4" aria-hidden />
            Torna alla pagina iniziale
          </Link>
          <header className="mt-6 space-y-3 border-b pb-8">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{titolo}</h1>
            <p className="text-lg text-muted-foreground">{introduzione}</p>
            <p className="text-sm text-muted-foreground">Ultimo aggiornamento: {AGGIORNAMENTO_PAGINE_LEGALI}</p>
          </header>
          <div className="mt-8 space-y-8">{children}</div>
        </article>
      </main>
      <PiePagina />
    </div>
  );
}

/** Sezione numerata di una pagina legale. */
export function Sezione({ id, titolo, children }: { id: string; titolo: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titolo`} className="scroll-mt-20 space-y-3">
      <h2 id={`${id}-titolo`} className="text-xl font-semibold tracking-tight">
        {titolo}
      </h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

/** Blocco con l'identità del venditore / titolare. */
export function DatiVenditore() {
  return (
    <ul className="!list-none !pl-0">
      <li>
        <strong>{venditore.nome}</strong>, {venditore.attivita.toLowerCase()}
      </li>
      <li>Sede: {venditore.indirizzo}</li>
      <li>Partita IVA: {venditore.partitaIva}</li>
      {venditore.codiceFiscale && <li>Codice fiscale: {venditore.codiceFiscale}</li>}
      <li>
        Email: <a href={`mailto:${venditore.email}`}>{venditore.email}</a>
      </li>
      {venditore.pec && (
        <li>
          PEC: <a href={`mailto:${venditore.pec}`}>{venditore.pec}</a>
        </li>
      )}
    </ul>
  );
}
