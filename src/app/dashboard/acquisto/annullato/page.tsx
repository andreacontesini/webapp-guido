import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleSlashIcon } from "lucide-react";

import { EsitoAcquisto } from "@/components/acquisto/esito-acquisto";
import { PopupAcquisto } from "@/components/acquisto/popup-acquisto";
import { leggiStatoGuida } from "@/lib/guida";
import { isIdLanding } from "@/lib/landing/eventi";
import { EMAIL_ASSISTENZA, isCodiceProdotto, prodotti, type CodiceProdotto } from "@/lib/prodotti";
import { acquistoDisponibile } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pagamento annullato",
  robots: { index: false, follow: false },
};

/**
 * Ritorno da Stripe Checkout quando l'utente annulla il pagamento
 * (`?prodotto=guida&origine=<id landing>`): "Riprova" riapre il popup di acquisto.
 */
export default function PaginaAnnullato({ searchParams }: PageProps<"/dashboard/acquisto/annullato">) {
  return (
    <Suspense fallback={<Contenuto />}>
      <ContenutoConProdotto searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenutoConProdotto({
  searchParams,
}: Pick<PageProps<"/dashboard/acquisto/annullato">, "searchParams">) {
  const { prodotto, origine } = await searchParams;
  if (!isCodiceProdotto(prodotto)) return <Contenuto />;

  // Se nel frattempo il prodotto risulta già attivo (es. pagato da un'altra
  // scheda) non ha senso proporre di riacquistarlo.
  const giaAttivo = prodotto === "guida" && (await leggiStatoGuida()).stato !== "non-abilitata";
  return (
    <Contenuto
      prodotto={prodotto}
      riprova={!giaAttivo && acquistoDisponibile(prodotto)}
      origine={isIdLanding(origine) ? origine : undefined}
    />
  );
}

function Contenuto({
  prodotto,
  riprova = false,
  origine,
}: {
  prodotto?: CodiceProdotto;
  riprova?: boolean;
  origine?: string;
}) {
  const delNome = prodotto ? prodotti[prodotto].delNome : undefined;
  return (
    <EsitoAcquisto
      icona={CircleSlashIcon}
      tono="neutro"
      titolo="Pagamento annullato"
      azionePrincipale={{ etichetta: "Torna alla tua area", href: "/dashboard" }}
      azioneSecondaria={
        riprova ? { etichetta: "Torna alla tua area", href: "/dashboard" } : undefined
      }
      pulsantePrincipale={
        riprova && prodotto ? (
          <PopupAcquisto prodotto={prodotto} pagamentoAttivo etichetta="Riprova" origine={origine} />
        ) : undefined
      }
    >
      <p>
        Nessun addebito è stato effettuato. Puoi riprovare l&apos;acquisto
        {delNome ? ` ${delNome}` : ""} quando vuoi.
      </p>
      <p className="text-sm">
        Hai avuto un problema con il pagamento? Scrivici a{" "}
        <a
          href={`mailto:${EMAIL_ASSISTENZA}`}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {EMAIL_ASSISTENZA}
        </a>
        .
      </p>
    </EsitoAcquisto>
  );
}
