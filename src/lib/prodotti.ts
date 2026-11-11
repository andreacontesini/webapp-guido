/**
 * Prodotti acquistabili dalla dashboard.
 * Prezzi e collegamento a Stripe arriveranno con la Fase 9.
 */
export const prodotti = {
  guida: {
    nome: "La guida",
    /** Per frasi come "l'attivazione della guida". */
    delNome: "della guida",
    titoloCompleto: "Una vendita buona e giusta",
    descrizione:
      "La guida pratica in 7 tappe: dai controlli preliminari al rogito notarile.",
    href: "/dashboard/guida",
    etichettaApri: "Apri la guida",
  },
  videocorso: {
    nome: "Il videocorso",
    delNome: "del videocorso",
    titoloCompleto: "Videocorso completo",
    descrizione:
      "Lezioni video su ogni fase della vendita, con modelli e documenti da scaricare.",
    href: "/dashboard/videocorso",
    etichettaApri: "Vai al videocorso",
  },
} as const;

export type CodiceProdotto = keyof typeof prodotti;

export function isCodiceProdotto(valore: unknown): valore is CodiceProdotto {
  return typeof valore === "string" && valore in prodotti;
}

/** Contatto per problemi con un pagamento. */
export const EMAIL_ASSISTENZA = "info@guidocontesini.it";
