"use client";

import { ArrowLeftIcon, ShieldIcon } from "lucide-react";

import { VoceInferiore } from "@/components/layout/barra-inferiore";
import { VoceLaterale } from "@/components/layout/barra-laterale";
import type { VoceNavigazione } from "@/components/layout/nav-items";
import { PERCORSO_ADMIN, PERCORSO_INIZIALE } from "@/lib/auth/percorsi";

/**
 * Voci che passano da un'area all'altra, nello stesso punto (in fondo alla
 * sidebar, in coda alla barra in basso). Etichette brevi: la sidebar è stretta.
 */
const voci = {
  amministrazione: {
    voce: { titolo: "Admin", href: PERCORSO_ADMIN, icona: ShieldIcon },
    descrizione: "Amministrazione",
  },
  ritorno: {
    voce: { titolo: "Indietro", href: PERCORSO_INIZIALE, icona: ArrowLeftIcon },
    descrizione: "Torna alla tua area",
  },
} satisfies Record<string, { voce: VoceNavigazione; descrizione: string }>;

export type TipoVoceFondo = keyof typeof voci;

export function VoceFondo({
  tipo,
  posizione,
}: {
  tipo: TipoVoceFondo;
  posizione: "laterale" | "inferiore";
}) {
  const { voce, descrizione } = voci[tipo];
  const Voce = posizione === "laterale" ? VoceLaterale : VoceInferiore;
  return (
    <li title={descrizione}>
      <Voce voce={voce} attiva={false} />
    </li>
  );
}
