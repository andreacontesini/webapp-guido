/** Toglie la "/" finale da un indirizzo. */
const senzaBarraFinale = (indirizzo: string) => indirizzo.replace(/\/$/, "");

/**
 * Indirizzo pubblico dell'app (area riservata, accesso, admin), senza "/"
 * finale: link nelle email e URL di ritorno da Stripe. In locale vale
 * http://localhost:3000 (da `.env.local`).
 */
export function urlApp() {
  return senzaBarraFinale(process.env.NEXT_PUBLIC_APP_URL ?? "https://app.guidocontesini.it");
}

/**
 * Indirizzo pubblico delle landing di vendita, senza "/" finale: URL canonici,
 * sitemap e anteprime per la condivisione. Per ora coincide con quello
 * dell'app; quando le landing passeranno al dominio principale basterà
 * impostare `NEXT_PUBLIC_LANDING_URL` (vedi TODO.md, "In futuro").
 */
export function urlLanding() {
  const indirizzo = process.env.NEXT_PUBLIC_LANDING_URL;
  return indirizzo ? senzaBarraFinale(indirizzo) : urlApp();
}

/**
 * Link a una pagina dell'app da una landing: relativo se landing e app stanno
 * sullo stesso dominio, assoluto (verso l'app) se stanno su domini diversi.
 */
export function linkApp(percorso: string) {
  return urlLanding() === urlApp() ? percorso : `${urlApp()}${percorso}`;
}
