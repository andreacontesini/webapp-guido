import type { Metadata } from "next";

import type { LandingPubblica } from "@/lib/landing/dati";
import { prodotti } from "@/lib/prodotti";

export const NOME_SITO = "Vendere Casa da Privato";

/** Immagine di anteprima generata dall'app (`src/app/opengraph-image.tsx`). */
const IMMAGINE_PREDEFINITA = "/opengraph-image";

/** Percorso pubblico della landing: "/" se è la pagina iniziale. */
export const percorsoLanding = (landing: Pick<LandingPubblica, "slug" | "paginaIniziale">) =>
  landing.paginaIniziale ? "/" : `/${landing.slug}`;

/**
 * Titolo, descrizione, URL canonico e anteprima per la condivisione.
 * Gli indirizzi relativi diventano assoluti con `metadataBase` del layout
 * principale, cioè con l'indirizzo delle landing (`urlLanding()`).
 */
export function metadatiLanding(landing: LandingPubblica): Metadata {
  const titolo = landing.seoTitolo ?? landing.titolo;
  const descrizione = landing.seoDescrizione ?? prodotti.guida.descrizione;
  const percorso = percorsoLanding(landing);
  const immagine = landing.immagineAnteprima ?? IMMAGINE_PREDEFINITA;

  return {
    title: { absolute: titolo },
    description: descrizione,
    alternates: { canonical: percorso },
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: NOME_SITO,
      url: percorso,
      title: titolo,
      description: descrizione,
      images: [{ url: immagine, width: 1200, height: 630, alt: titolo }],
    },
    twitter: {
      card: "summary_large_image",
      title: titolo,
      description: descrizione,
      images: [immagine],
    },
  };
}
