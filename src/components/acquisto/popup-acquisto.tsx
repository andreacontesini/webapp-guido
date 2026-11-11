"use client";

import { CheckIcon, ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EMAIL_ASSISTENZA,
  formattaPrezzo,
  prodotti,
  type CodiceProdotto,
} from "@/lib/prodotti";

/**
 * Pulsante "Acquista" che apre il popup con descrizione e prezzo del prodotto.
 * Il pulsante del popup porterà a Stripe Checkout con la Fase 9: fino ad
 * allora è disattivato e indica come ottenere l'accesso.
 */
export function PopupAcquisto({
  prodotto,
  size = "lg",
}: {
  prodotto: CodiceProdotto;
  size?: "default" | "lg";
}) {
  const scheda = prodotti[prodotto];
  const prezzo: number | null = scheda.prezzo;

  return (
    <Dialog>
      <DialogTrigger render={<Button size={size} />}>
        <ShoppingCartIcon aria-hidden />
        {scheda.etichettaAcquista}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {scheda.nome}
          </p>
          <DialogTitle>{scheda.titoloCompleto}</DialogTitle>
          <DialogDescription>{scheda.descrizione}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="font-medium text-foreground">Cosa trovi</p>
          <ul className="space-y-2">
            {scheda.inclusi.map((punto) => (
              <li key={punto} className="flex gap-2.5 text-muted-foreground">
                <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CheckIcon className="size-3" aria-hidden />
                </span>
                {punto}
              </li>
            ))}
          </ul>
        </div>

        <dl className="grid grid-cols-3 gap-2">
          {scheda.dettagli.map(({ etichetta, valore }) => (
            <div key={etichetta} className="rounded-lg border px-3 py-2">
              <dt className="text-xs text-muted-foreground">{etichetta}</dt>
              <dd className="font-medium text-foreground">{valore}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-baseline justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
          <span className="text-muted-foreground">Prezzo</span>
          <span className="text-lg font-semibold tabular-nums">
            {prezzo === null ? "In arrivo" : formattaPrezzo(prezzo)}
          </span>
        </div>

        <p className="text-muted-foreground">
          Il pagamento online sarà attivo a breve. Per avere subito l&apos;accesso
          scrivici a{" "}
          <a
            href={`mailto:${EMAIL_ASSISTENZA}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {EMAIL_ASSISTENZA}
          </a>
          .
        </p>

        <DialogFooter>
          <Button size="lg" disabled>
            Acquista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
