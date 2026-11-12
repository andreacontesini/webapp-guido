import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginaLanding } from "@/components/landing/pagina-landing";
import { elencoLandingPubblicate, leggiLandingPubblicata } from "@/lib/landing/dati";
import { metadatiLanding } from "@/lib/landing/metadati";
import { isSlugValido } from "@/lib/landing/slug";

/**
 * Landing di vendita pubblica: /<slug>.
 * Le landing pubblicate vengono generate alla build; quelle pubblicate dopo
 * vengono generate alla prima visita e poi restano in cache.
 */
/**
 * Navigazione "bloccante": l'intera pagina dipende dallo slug ed è già
 * prerenderizzata (o in cache) per ogni landing, quindi non serve un guscio
 * con segnaposto. Così uno slug inesistente risponde con un vero 404.
 */
export const instant = false;

export async function generateStaticParams() {
  const landing = await elencoLandingPubblicate();
  // Con Cache Components serve almeno un parametro: se non ci sono landing
  // si usa uno slug segnaposto, che risponde con la pagina 404.
  return landing.length > 0
    ? landing.map(({ slug }) => ({ slug }))
    : [{ slug: "nessuna-landing" }];
}

async function leggi(params: PageProps<"/[slug]">["params"]) {
  const { slug } = await params;
  return isSlugValido(slug) ? leggiLandingPubblicata(slug) : null;
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const landing = await leggi(params);
  return landing ? metadatiLanding(landing) : {};
}

export default async function PaginaLandingPubblica({ params }: PageProps<"/[slug]">) {
  const landing = await leggi(params);
  if (!landing) notFound();
  return <PaginaLanding landing={landing} />;
}
