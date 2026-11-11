"use client";

import { ShieldIcon } from "lucide-react";

import { VoceInferiore } from "@/components/layout/barra-inferiore";
import { VoceLaterale } from "@/components/layout/barra-laterale";
import type { VoceNavigazione } from "@/components/layout/nav-items";
import { PERCORSO_ADMIN } from "@/lib/auth/percorsi";

// "Amministrazione" non entra nella sidebar stretta: etichetta breve.
const voce: VoceNavigazione = { titolo: "Admin", href: PERCORSO_ADMIN, icona: ShieldIcon };

/** Voce verso il back office: la mostra `SoloAdmin` solo agli admin. */
export function VoceAmministrazione({ tipo }: { tipo: "laterale" | "inferiore" }) {
  const Voce = tipo === "laterale" ? VoceLaterale : VoceInferiore;
  return (
    <li title="Amministrazione">
      <Voce voce={voce} attiva={false} />
    </li>
  );
}
