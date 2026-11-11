/**
 * Prodotti acquistabili dalla dashboard.
 * Prezzi e collegamento a Stripe arriveranno con la Fase 9.
 */
type SchedaProdotto = {
  nome: string;
  delNome: string;
  titoloCompleto: string;
  descrizione: string;
  /** Prezzo in euro (IVA inclusa); null finché non è definito. */
  prezzo: number | null;
  href: string;
  etichettaApri: string;
  etichettaAcquista: string;
};

export const prodotti = {
  guida: {
    nome: "La guida",
    /** Per frasi come "l'attivazione della guida". */
    delNome: "della guida",
    titoloCompleto: "Una vendita buona e giusta",
    descrizione:
      "La guida pratica in 7 tappe: dai controlli preliminari al rogito notarile.",
    prezzo: null,
    href: "/dashboard/guida",
    etichettaApri: "Apri la guida",
    etichettaAcquista: "Acquista la guida",
  },
  videocorso: {
    nome: "Il videocorso",
    delNome: "del videocorso",
    titoloCompleto: "Videocorso completo",
    descrizione:
      "Lezioni video su ogni fase della vendita, con modelli e documenti da scaricare.",
    prezzo: null,
    href: "/dashboard/videocorso",
    etichettaApri: "Vai al videocorso",
    etichettaAcquista: "Acquista il videocorso",
  },
} satisfies Record<string, SchedaProdotto>;

export type CodiceProdotto = keyof typeof prodotti;

export function isCodiceProdotto(valore: unknown): valore is CodiceProdotto {
  return typeof valore === "string" && valore in prodotti;
}

/** Contatto per problemi con un pagamento. */
export const EMAIL_ASSISTENZA = "info@guidocontesini.it";

/** Prezzo in formato italiano, es. "29,00 €". */
export function formattaPrezzo(euro: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(euro);
}
