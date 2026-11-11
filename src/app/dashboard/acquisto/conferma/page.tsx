import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

import { AttesaSblocco } from "@/app/dashboard/acquisto/conferma/attesa-sblocco";
import { EsitoAcquisto } from "@/components/acquisto/esito-acquisto";
import { leggiStatoGuida } from "@/lib/guida";
import { isCodiceProdotto, prodotti, type CodiceProdotto } from "@/lib/prodotti";

export const metadata: Metadata = {
  title: "Acquisto completato",
  robots: { index: false, follow: false },
};

/**
 * Ritorno da Stripe Checkout dopo un pagamento riuscito
 * (`?prodotto=guida|videocorso`, in Fase 6 anche `session_id`).
 * Mostra la conferma quando il contenuto risulta sbloccato, altrimenti attende.
 */
export default function PaginaConferma({ searchParams }: PageProps<"/dashboard/acquisto/conferma">) {
  return (
    <Suspense
      fallback={
        <EsitoAcquisto icona={LoaderCircleIcon} tono="attesa" titolo="Stiamo confermando il pagamento" animaIcona>
          <p>Un momento…</p>
        </EsitoAcquisto>
      }
    >
      <Esito searchParams={searchParams} />
    </Suspense>
  );
}

/** True se l'utente ha già accesso al prodotto acquistato. */
async function isSbloccato(codice: CodiceProdotto) {
  if (codice === "guida") return (await leggiStatoGuida()).stato !== "non-abilitata";
  // Il permesso per il videocorso arriverà con la Fase 11 (prodotto videocorso in purchases).
  return false;
}

async function Esito({ searchParams }: Pick<PageProps<"/dashboard/acquisto/conferma">, "searchParams">) {
  const { prodotto } = await searchParams;
  if (!isCodiceProdotto(prodotto)) redirect("/dashboard");

  const scheda = prodotti[prodotto];
  if (!(await isSbloccato(prodotto))) {
    return <AttesaSblocco nomeProdotto={scheda.nome} delNome={scheda.delNome} />;
  }

  return (
    <EsitoAcquisto
      icona={CheckIcon}
      tono="successo"
      titolo="Acquisto completato!"
      azionePrincipale={{ etichetta: scheda.etichettaApri, href: scheda.href }}
      azioneSecondaria={{ etichetta: "Torna alla tua area", href: "/dashboard" }}
    >
      <p>
        Grazie! <span className="font-medium text-foreground">{scheda.titoloCompleto}</span> è
        ora disponibile nella tua area, da qualsiasi dispositivo.
      </p>
      <p className="text-sm">Ti abbiamo inviato la ricevuta via email.</p>
    </EsitoAcquisto>
  );
}
