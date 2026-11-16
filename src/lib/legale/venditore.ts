import { EMAIL_ASSISTENZA } from "@/lib/prodotti";

/**
 * Dati del venditore e titolare del trattamento, usati da condizioni di
 * vendita, privacy, cookie e piè di pagina delle landing.
 *
 * I campi `null` sono da completare con i dati reali (vedi TODO.md, Fase 12):
 * finché mancano, le pagine mostrano un segnaposto evidenziato.
 */
export const venditore = {
  /** Nome e cognome o ragione sociale, come in fattura. */
  nome: "Guido Contesini",
  attivita: "Consulente immobiliare",
  /** Indirizzo completo della sede (via, CAP, comune, provincia). */
  indirizzo: null as string | null,
  partitaIva: null as string | null,
  codiceFiscale: null as string | null,
  pec: null as string | null,
  email: EMAIL_ASSISTENZA,
};

/** Data dell'ultima revisione delle pagine legali (da aggiornare a ogni modifica dei testi). */
export const AGGIORNAMENTO_PAGINE_LEGALI = "16 novembre 2026";

/** Pagine legali pubbliche, collegate dal piè di pagina delle landing. */
export const pagineLegali = [
  { href: "/condizioni-di-vendita", etichetta: "Condizioni di vendita" },
  { href: "/privacy", etichetta: "Privacy" },
  { href: "/cookie", etichetta: "Cookie" },
] as const;
