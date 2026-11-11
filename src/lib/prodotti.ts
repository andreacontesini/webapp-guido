/**
 * Prodotti acquistabili dalla dashboard.
 * Prezzi e collegamento a Stripe arriveranno con la Fase 9.
 */
type SchedaProdotto = {
  nome: string;
  delNome: string;
  titoloCompleto: string;
  descrizione: string;
  /** Cosa ottiene chi acquista, mostrato nel popup di acquisto. */
  inclusi: string[];
  /** Scheda tecnica breve (formato, pagine, autore…). */
  dettagli: { etichetta: string; valore: string }[];
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
    inclusi: [
      "7 tappe in ordine, dai controlli preliminari sull'immobile al rogito dal notaio",
      "L'esperienza di un mediatore immobiliare, spiegata in modo semplice e diretto",
      "Lettura online nella tua area riservata, da smartphone, tablet e computer",
      "Accesso personale, legato al tuo account",
    ],
    dettagli: [
      { etichetta: "Formato", valore: "Guida digitale" },
      { etichetta: "Pagine", valore: "18" },
      { etichetta: "Autore", valore: "Guido Contesini" },
    ],
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
    inclusi: [
      "Lezioni video su ogni fase della vendita",
      "Modelli e documenti da scaricare per ogni lezione",
      "Visione online nella tua area riservata, da qualsiasi dispositivo",
    ],
    dettagli: [
      { etichetta: "Formato", valore: "Video in streaming" },
      { etichetta: "Autore", valore: "Guido Contesini" },
    ],
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
export const EMAIL_ASSISTENZA = "contesiniconsulenze@gmail.com";

/** Prezzo in formato italiano, es. "29,00 €". */
export function formattaPrezzo(euro: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(euro);
}
