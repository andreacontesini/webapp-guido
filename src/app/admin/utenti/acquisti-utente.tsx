import { ExternalLinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isCodiceProdotto, prodotti } from "@/lib/prodotti";
import type { Acquisto, StatoAcquisto } from "@/lib/supabase/tipi";

export type RigaAcquisto = Pick<
  Acquisto,
  | "id"
  | "product"
  | "status"
  | "amount_total"
  | "currency"
  | "stripe_payment_intent_id"
  | "paid_at"
  | "created_at"
>;

const etichetteStato: Record<
  StatoAcquisto,
  { testo: string; variante: "default" | "secondary" | "destructive" | "outline" }
> = {
  pagato: { testo: "Pagato", variante: "default" },
  in_attesa: { testo: "In attesa", variante: "outline" },
  rimborsato: { testo: "Rimborsato", variante: "secondary" },
  contestato: { testo: "Contestato", variante: "destructive" },
};

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function importo({ amount_total, currency }: RigaAcquisto) {
  if (amount_total === null) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount_total / 100);
}

export function BadgeStatoAcquisto({ stato }: { stato: StatoAcquisto }) {
  const { testo, variante } = etichetteStato[stato];
  return <Badge variant={variante}>{testo}</Badge>;
}

/**
 * Riepilogo degli acquisti di un utente nella tabella admin: numero e stato
 * dell'ultimo, con il dettaglio completo in un popup. Rimborsi e
 * contestazioni si gestiscono dal pannello Stripe (link al pagamento): il
 * webhook aggiorna poi stato e accesso.
 */
export function AcquistiUtente({
  nome,
  acquisti,
  urlPagamentiStripe,
}: {
  nome: string;
  acquisti: RigaAcquisto[];
  /** Base dell'URL dei pagamenti nel pannello Stripe (test o live). */
  urlPagamentiStripe: string;
}) {
  if (acquisti.length === 0) {
    return <span className="text-muted-foreground">Nessuno</span>;
  }
  const [ultimo] = acquisti;

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="ghost" size="sm" className="-ml-2 h-auto gap-2 px-2 py-1" />}
      >
        <span className="tabular-nums">{acquisti.length}</span>
        <BadgeStatoAcquisto stato={ultimo.status} />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Acquisti</DialogTitle>
          <DialogDescription>{nome}</DialogDescription>
        </DialogHeader>
        <ul className="divide-y rounded-lg border">
          {acquisti.map((acquisto) => (
            <li key={acquisto.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {isCodiceProdotto(acquisto.product)
                    ? prodotti[acquisto.product].nome
                    : acquisto.product}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatoData.format(new Date(acquisto.paid_at ?? acquisto.created_at))}
                </p>
              </div>
              <span className="font-medium tabular-nums">{importo(acquisto)}</span>
              <BadgeStatoAcquisto stato={acquisto.status} />
              {acquisto.stripe_payment_intent_id && (
                <a
                  href={`${urlPagamentiStripe}/${acquisto.stripe_payment_intent_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                >
                  Stripe
                  <ExternalLinkIcon className="size-3.5" aria-hidden />
                  <span className="sr-only">(apre il pagamento in una nuova scheda)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Rimborsi e contestazioni si gestiscono su Stripe: l&apos;app aggiorna da sola lo
          stato e l&apos;accesso. L&apos;interruttore della guida resta disponibile per
          assegnarla o revocarla a mano.
        </p>
      </DialogContent>
    </Dialog>
  );
}
