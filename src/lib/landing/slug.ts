/**
 * Indirizzi delle landing (/<slug>). Gli stessi vincoli sono ripetuti nel
 * database (check su `landing_pages.slug`).
 */

/** Percorsi di primo livello già usati dall'app: non possono essere landing. */
export const PERCORSI_RISERVATI = [
  "accesso",
  "acquisto",
  "admin",
  "anteprima",
  "api",
  "auth",
  "benvenuto",
  "condizioni-di-vendita",
  "cookie",
  "dashboard",
  "opengraph-image",
  "privacy",
  "robots.txt",
  "sitemap.xml",
  "twitter-image",
] as const;

const formatoSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** True se lo slug ha il formato giusto e non è un percorso riservato. */
export function isSlugValido(slug: string) {
  return (
    slug.length <= 80 &&
    formatoSlug.test(slug) &&
    !(PERCORSI_RISERVATI as readonly string[]).includes(slug)
  );
}
