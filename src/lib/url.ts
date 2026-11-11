/**
 * Indirizzo pubblico dell'app, senza "/" finale: link nelle email e URL di
 * ritorno da Stripe. In locale vale http://localhost:3000 (da `.env.local`).
 */
export function urlApp() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.guidocontesini.it").replace(/\/$/, "");
}
