import type { Metadata } from "next";

import { PaginaInizialePredefinita } from "@/components/landing/pagina-iniziale-predefinita";
import { PaginaLanding } from "@/components/landing/pagina-landing";
import { leggiLandingIniziale } from "@/lib/landing/dati";
import { metadatiLanding } from "@/lib/landing/metadati";

/**
 * Pagina iniziale: la landing scelta in admin come pagina iniziale oppure,
 * se non ce n'è una, la presentazione predefinita con l'invito all'accesso.
 */
export async function generateMetadata(): Promise<Metadata> {
  const landing = await leggiLandingIniziale();
  return landing ? metadatiLanding(landing) : { alternates: { canonical: "/" } };
}

export default async function Home() {
  const landing = await leggiLandingIniziale();
  return landing ? <PaginaLanding landing={landing} /> : <PaginaInizialePredefinita />;
}
