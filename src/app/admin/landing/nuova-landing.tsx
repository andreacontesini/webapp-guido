"use client";

import { useActionState, useState } from "react";
import { PlusIcon } from "lucide-react";

import { creaLanding, type StatoNuovaLanding } from "@/app/admin/landing/azioni";
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
import { Input } from "@/components/ui/input";
import { slugDaTitolo } from "@/lib/landing/editor";

const statoIniziale: StatoNuovaLanding = { errori: {}, valori: { titolo: "", slug: "" } };

/** Popup per creare una nuova landing in bozza; poi si apre l'editor. */
export function NuovaLanding({ base }: { base: string }) {
  const [stato, crea, inCorso] = useActionState(creaLanding, statoIniziale);
  const [titolo, setTitolo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugToccato, setSlugToccato] = useState(false);

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <PlusIcon aria-hidden />
        Nuova landing
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuova landing</DialogTitle>
          <DialogDescription>
            Nasce come bozza con apertura e prezzo: poi aggiungi i blocchi nell&apos;editor.
          </DialogDescription>
        </DialogHeader>
        <form action={crea} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="nuova-titolo" className="text-sm font-medium">
              Nome interno
            </label>
            <Input
              id="nuova-titolo"
              name="titolo"
              required
              value={titolo}
              onChange={(e) => {
                setTitolo(e.target.value);
                if (!slugToccato) setSlug(slugDaTitolo(e.target.value));
              }}
            />
            {stato.errori.titolo && <p className="text-xs text-destructive">{stato.errori.titolo}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="nuova-slug" className="text-sm font-medium">
              Indirizzo
            </label>
            <Input
              id="nuova-slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugToccato(true);
                setSlug(e.target.value.toLowerCase());
              }}
            />
            <p className="text-xs break-all text-muted-foreground">
              {base}/{slug || "…"}
            </p>
            {stato.errori.slug && <p className="text-xs text-destructive">{stato.errori.slug}</p>}
          </div>
          {stato.errore && (
            <p role="alert" className="text-sm text-destructive">
              {stato.errore}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={inCorso}>
              {inCorso ? "Creazione…" : "Crea e apri l'editor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
