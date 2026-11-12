import Link from "next/link";
import { BookOpenIcon, LogInIcon } from "lucide-react";

import { PopupAcquisto } from "@/components/acquisto/popup-acquisto";
import { BloccoLanding, type ContestoLanding } from "@/components/landing/blocchi";
import { Button } from "@/components/ui/button";
import { PERCORSO_ACCESSO } from "@/lib/auth/percorsi";
import { haAcquisto } from "@/lib/landing/blocchi";
import type { LandingPubblica } from "@/lib/landing/dati";
import { EMAIL_ASSISTENZA, formattaPrezzo, prodotti } from "@/lib/prodotti";
import { acquistoDisponibile } from "@/lib/stripe";
import { linkApp } from "@/lib/url";

/**
 * Pagina pubblica di una landing: intestazione essenziale, blocchi nell'ordine
 * salvato, piè di pagina e, su smartphone, barra di acquisto fissa in basso.
 *
 * Il pulsante "Acquista" apre il popup di acquisto (oggi richiede l'accesso);
 * con la Fase 7 porterà direttamente a Stripe Checkout anche senza account.
 */
export function PaginaLanding({ landing }: { landing: LandingPubblica }) {
  const contesto: ContestoLanding = {
    pagamentoAttivo: acquistoDisponibile("guida"),
    ancoraContenuti: landing.blocchi.find((b) => b.tipo === "tappe")?.id,
  };
  const conAcquisto = haAcquisto(landing.blocchi);

  return (
    <div className={conAcquisto ? "flex flex-1 flex-col pb-24 sm:pb-0" : "flex flex-1 flex-col"}>
      <Intestazione />
      <main className="flex-1">
        {landing.blocchi.map((blocco, i) => (
          <BloccoLanding key={blocco.id ?? i} blocco={blocco} contesto={contesto} />
        ))}
      </main>
      <PiePagina />
      {conAcquisto && <BarraAcquisto pagamentoAttivo={contesto.pagamentoAttivo} />}
    </div>
  );
}

function Intestazione() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpenIcon className="size-4" aria-hidden />
          </span>
          <span className="leading-tight">
            Vendere casa da privato
            <span className="block text-xs font-normal text-muted-foreground">
              di Guido Contesini
            </span>
          </span>
        </Link>
        <Button
          variant="ghost"
          render={<Link href={linkApp(PERCORSO_ACCESSO)} />}
          nativeButton={false}
        >
          <LogInIcon aria-hidden />
          Accedi
        </Button>
      </div>
    </header>
  );
}

function PiePagina() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © 2026 Guido Contesini · Consulente immobiliare,
          Lago di Garda
        </p>
        <p>
          Assistenza:{" "}
          <a
            href={`mailto:${EMAIL_ASSISTENZA}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {EMAIL_ASSISTENZA}
          </a>
        </p>
      </div>
    </footer>
  );
}

/** Barra fissa in basso su smartphone: il pulsante di acquisto resta sempre a portata. */
function BarraAcquisto({ pagamentoAttivo }: { pagamentoAttivo: boolean }) {
  const guida = prodotti.guida;
  const prezzo: number | null = guida.prezzo;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{guida.titoloCompleto}</p>
          <p className="text-xs text-muted-foreground">
            {prezzo === null ? guida.nome : formattaPrezzo(prezzo)}
          </p>
        </div>
        <PopupAcquisto prodotto="guida" pagamentoAttivo={pagamentoAttivo} etichetta="Acquista" />
      </div>
    </div>
  );
}
