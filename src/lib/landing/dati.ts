import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { normalizzaBlocchi, type Blocco } from "@/lib/landing/blocchi";
import { creaClientPubblico } from "@/lib/supabase/pubblico";

/**
 * Lettura delle landing pubblicate per le pagine pubbliche.
 * I risultati restano in cache (le landing cambiano di rado) e si aggiornano
 * subito quando l'admin le modifica: le azioni del back office chiamano
 * `updateTag(TAG_LANDING)`.
 */
export const TAG_LANDING = "landing";

export type LandingPubblica = {
  id: string;
  slug: string;
  titolo: string;
  seoTitolo: string | null;
  seoDescrizione: string | null;
  immagineAnteprima: string | null;
  blocchi: Blocco[];
  paginaIniziale: boolean;
  aggiornataIl: string;
};

const CAMPI =
  "id, slug, title, seo_title, seo_description, og_image_url, blocks, is_home, updated_at" as const;

type RigaLanding = {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  blocks: unknown;
  is_home: boolean;
  updated_at: string;
};

export const converti = (riga: RigaLanding): LandingPubblica => ({
  id: riga.id,
  slug: riga.slug,
  titolo: riga.title,
  seoTitolo: riga.seo_title,
  seoDescrizione: riga.seo_description,
  immagineAnteprima: riga.og_image_url,
  blocchi: normalizzaBlocchi(riga.blocks),
  paginaIniziale: riga.is_home,
  aggiornataIl: riga.updated_at,
});

/** Landing pubblicata con questo slug, o `null`. */
export async function leggiLandingPubblicata(slug: string): Promise<LandingPubblica | null> {
  "use cache";
  cacheTag(TAG_LANDING);
  cacheLife("hours");

  const { data, error } = await creaClientPubblico()
    .from("landing_pages")
    .select(CAMPI)
    .eq("slug", slug)
    .eq("status", "pubblicata")
    .maybeSingle();

  if (error) console.error(`Lettura landing "${slug}" non riuscita`, error);
  return data ? converti(data) : null;
}

/** Landing scelta come pagina iniziale, o `null` se non ce n'è una. */
export async function leggiLandingIniziale(): Promise<LandingPubblica | null> {
  "use cache";
  cacheTag(TAG_LANDING);
  cacheLife("hours");

  const { data, error } = await creaClientPubblico()
    .from("landing_pages")
    .select(CAMPI)
    .eq("is_home", true)
    .eq("status", "pubblicata")
    .maybeSingle();

  if (error) console.error("Lettura landing iniziale non riuscita", error);
  return data ? converti(data) : null;
}

/** Slug e data di aggiornamento di tutte le landing pubblicate (sitemap). */
export async function elencoLandingPubblicate(): Promise<
  { slug: string; paginaIniziale: boolean; aggiornataIl: string }[]
> {
  "use cache";
  cacheTag(TAG_LANDING);
  cacheLife("hours");

  const { data, error } = await creaClientPubblico()
    .from("landing_pages")
    .select("slug, is_home, updated_at")
    .eq("status", "pubblicata")
    .order("updated_at", { ascending: false });

  if (error) console.error("Elenco landing non riuscito", error);
  return (data ?? []).map((r) => ({
    slug: r.slug,
    paginaIniziale: r.is_home,
    aggiornataIl: r.updated_at,
  }));
}
