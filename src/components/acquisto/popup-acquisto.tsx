"use client";

import { ShoppingCartIcon } from "lucide-react";

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
      <DialogContent>
        <DialogHeader>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {scheda.nome}
          </p>
          <DialogTitle>{scheda.titoloCompleto}</DialogTitle>
          <DialogDescription>{scheda.descrizione}</DialogDescription>
        </DialogHeader>

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
