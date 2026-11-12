import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleSlashIcon } from "lucide-react";

import { EsitoAcquisto } from "@/components/acquisto/esito-acquisto";
import { PopupAcquisto } from "@/components/acquisto/popup-acquisto";
import { isIdLanding } from "@/lib/landing/eventi";
import { EMAIL_ASSISTENZA, isCodiceProdotto, type CodiceProdotto } from "@/lib/prodotti";
import { acquistoDisponibile } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pagamento annullato",
  robots: { index: false, follow: false },
};

/**
 * Ritorno da Stripe Checkout quando chi acquista senza account annulla
 * (`?prodotto=guida&origine=<id landing>`): "Riprova" riapre il pagamento.
 */
export default function PaginaAnnullatoOspite({ searchParams }: PageProps<"/acquisto/annullato">) {
  return (
    <Suspense fallback={<Contenuto />}>
      <ContenutoConProdotto searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenutoConProdotto({
  searchParams,
}: Pick<PageProps<"/acquisto/annullato">, "searchParams">) {
  const { prodotto, origine } = await searchParams;
  if (!isCodiceProdotto(prodotto) || !acquistoDisponibile(prodotto)) return <Contenuto />;
  return <Contenuto prodotto={prodotto} origine={isIdLanding(origine) ? origine : undefined} />;
}

function Contenuto({ prodotto, origine }: { prodotto?: CodiceProdotto; origine?: string }) {
  return (
    <EsitoAcquisto
      icona={CircleSlashIcon}
      tono="neutro"
      titolo="Pagamento annullato"
      azionePrincipale={{ etichetta: "Torna alla pagina iniziale", href: "/" }}
      azioneSecondaria={prodotto ? { etichetta: "Pagina iniziale", href: "/" } : undefined}
      pulsantePrincipale={
        prodotto ? (
          <PopupAcquisto prodotto={prodotto} pagamentoAttivo diretto etichetta="Riprova" origine={origine} />
        ) : undefined
      }
    >
      <p>Nessun addebito è stato effettuato. Puoi riprovare l&apos;acquisto quando vuoi.</p>
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
