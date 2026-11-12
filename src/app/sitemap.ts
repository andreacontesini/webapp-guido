import type { MetadataRoute } from "next";

import { elencoLandingPubblicate } from "@/lib/landing/dati";
import { urlLanding } from "@/lib/url";

/**
 * Sitemap delle pagine pubbliche: pagina iniziale e landing pubblicate.
 * L'area riservata e il back office non sono indicizzati.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlLanding();
  const landing = await elencoLandingPubblicate();
  const iniziale = landing.find((l) => l.paginaIniziale);

  return [
    {
      url: `${base}/`,
      lastModified: iniziale?.aggiornataIl,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...landing
      // La landing iniziale ha come indirizzo canonico "/".
      .filter((l) => !l.paginaIniziale)
      .map((l) => ({
        url: `${base}/${l.slug}`,
        lastModified: l.aggiornataIl,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
