import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleSlashIcon } from "lucide-react";

import { EsitoAcquisto } from "@/components/acquisto/esito-acquisto";
import { EMAIL_ASSISTENZA, isCodiceProdotto, prodotti } from "@/lib/prodotti";

export const metadata: Metadata = {
  title: "Pagamento annullato",
  robots: { index: false, follow: false },
};

/** Ritorno da Stripe Checkout quando l'utente annulla il pagamento. */
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
  const { prodotto } = await searchParams;
  return <Contenuto delNome={isCodiceProdotto(prodotto) ? prodotti[prodotto].delNome : undefined} />;
}

function Contenuto({ delNome }: { delNome?: string }) {
  return (
    <EsitoAcquisto
      icona={CircleSlashIcon}
      tono="neutro"
      titolo="Pagamento annullato"
      // In Fase 5 "Riprova" riaprirà il popup di acquisto del prodotto.
      azionePrincipale={{ etichetta: "Torna alla tua area", href: "/dashboard" }}
    >
      <p>
        Nessun addebito è stato effettuato. Puoi riprovare l&apos;acquisto
        {delNome ? ` ${delNome}` : ""} quando vuoi dalla tua area.
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
