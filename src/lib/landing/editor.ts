/**
 * Schema dell'editor delle landing: per ogni tipo di blocco, i campi da
 * mostrare nel modulo e il contenuto iniziale di un blocco nuovo.
 * Le chiavi dei campi coincidono con quelle del JSON salvato (vedi
 * `src/lib/landing/blocchi.ts`), quindi l'editor modifica il JSON così com'è.
 */
import {
  FORMATI_VIDEO,
  ICONE_PUNTI,
  type IconaPunto,
  type TipoBlocco,
} from "@/lib/landing/blocchi";

type Comune = { chiave: string; etichetta: string; aiuto?: string; obbligatorio?: boolean };

export type Campo =
  | (Comune & { tipo: "testo" })
  | (Comune & { tipo: "testo-lungo" })
  | (Comune & { tipo: "immagine" })
  | (Comune & { tipo: "url" })
  | (Comune & { tipo: "booleano" })
  | (Comune & { tipo: "numero"; min?: number; max?: number })
  | (Comune & { tipo: "scelta"; opzioni: { valore: string | number; etichetta: string }[] })
  | (Comune & { tipo: "elenco-testi"; etichettaElemento: string })
  | (Comune & { tipo: "elenco"; etichettaElemento: string; campi: Campo[] });

const nomiIcone: Record<IconaPunto, string> = {
  sicurezza: "Scudo (sicurezza)",
  metodo: "Elenco spuntato (metodo)",
  valore: "Etichetta prezzo (valore)",
  costi: "Calcolatrice (costi)",
  documenti: "Documento (documenti)",
  tempo: "Orologio (tempo)",
  casa: "Casa",
  dialogo: "Fumetti (dialogo)",
};

export const SCHEMI_BLOCCHI: Record<TipoBlocco, Campo[]> = {
  hero: [
    { tipo: "testo", chiave: "etichetta", etichetta: "Etichetta sopra il titolo", aiuto: "Es. «Guida pratica · 7 tappe»" },
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
    { tipo: "testo", chiave: "evidenza", etichetta: "Seconda parte del titolo (in blu)" },
    { tipo: "testo-lungo", chiave: "sottotitolo", etichetta: "Sottotitolo", obbligatorio: true },
    { tipo: "testo", chiave: "nota", etichetta: "Nota sotto il pulsante" },
    {
      tipo: "elenco",
      chiave: "numeri",
      etichetta: "Numeri chiave",
      aiuto: "Solo dati reali. Ne bastano 2 o 3.",
      etichettaElemento: "numero",
      campi: [
        { tipo: "testo", chiave: "valore", etichetta: "Valore", obbligatorio: true },
        { tipo: "testo", chiave: "etichetta", etichetta: "Descrizione", obbligatorio: true },
      ],
    },
  ],
  "punti-chiave": [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
    { tipo: "testo-lungo", chiave: "sottotitolo", etichetta: "Sottotitolo" },
    {
      tipo: "elenco",
      chiave: "punti",
      etichetta: "Punti",
      etichettaElemento: "punto",
      campi: [
        {
          tipo: "scelta",
          chiave: "icona",
          etichetta: "Icona",
          opzioni: ICONE_PUNTI.map((i) => ({ valore: i, etichetta: nomiIcone[i] })),
        },
        { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
        { tipo: "testo-lungo", chiave: "testo", etichetta: "Testo", obbligatorio: true },
      ],
    },
  ],
  tappe: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
    { tipo: "testo-lungo", chiave: "sottotitolo", etichetta: "Sottotitolo" },
    {
      tipo: "elenco",
      chiave: "tappe",
      etichetta: "Tappe",
      etichettaElemento: "tappa",
      campi: [
        { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
        { tipo: "testo", chiave: "testo", etichetta: "Descrizione (una riga)", obbligatorio: true },
      ],
    },
  ],
  testo: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    { tipo: "elenco-testi", chiave: "paragrafi", etichetta: "Paragrafi", etichettaElemento: "paragrafo" },
  ],
  immagine: [
    { tipo: "immagine", chiave: "url", etichetta: "Immagine", obbligatorio: true },
    { tipo: "testo", chiave: "alt", etichetta: "Descrizione per chi non vede l'immagine", obbligatorio: true },
    { tipo: "testo", chiave: "didascalia", etichetta: "Didascalia" },
  ],
  video: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    { tipo: "testo-lungo", chiave: "testo", etichetta: "Testo di accompagnamento" },
    {
      tipo: "url",
      chiave: "indirizzo",
      etichetta: "Indirizzo del video",
      obbligatorio: true,
      aiuto:
        "Bunny Stream (link di embed o di riproduzione), YouTube, Vimeo oppure un file .mp4/.webm in https.",
    },
    {
      tipo: "immagine",
      chiave: "copertinaUrl",
      etichetta: "Copertina",
      aiuto: "Mostrata prima della riproduzione. Per YouTube, se manca, si usa la miniatura del video.",
    },
    {
      tipo: "scelta",
      chiave: "formato",
      etichetta: "Formato",
      opzioni: FORMATI_VIDEO.map((f) => ({
        valore: f,
        etichetta: { "16:9": "16:9 orizzontale", "9:16": "9:16 verticale", "1:1": "1:1 quadrato" }[f],
      })),
    },
    {
      tipo: "booleano",
      chiave: "avvioAutomatico",
      etichetta: "Avvio automatico quando il video è visibile",
      aiuto: "I browser lo consentono solo senza audio: il video partirà muto.",
    },
    { tipo: "booleano", chiave: "muto", etichetta: "Audio disattivato all'avvio" },
    { tipo: "booleano", chiave: "ripeti", etichetta: "Ripetizione continua" },
    { tipo: "booleano", chiave: "controlli", etichetta: "Controlli del player visibili" },
    { tipo: "booleano", chiave: "sottotitoli", etichetta: "Sottotitoli attivi (se presenti)" },
    { tipo: "numero", chiave: "inizio", etichetta: "Parti dal secondo", min: 0 },
    { tipo: "booleano", chiave: "pulsanteAcquisto", etichetta: "Pulsante «Acquista» sotto il video" },
  ],
  galleria: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    {
      tipo: "scelta",
      chiave: "modalita",
      etichetta: "Modalità",
      opzioni: [
        { valore: "griglia", etichetta: "Griglia (con ingrandimento)" },
        { valore: "carosello", etichetta: "Carosello a scorrimento" },
      ],
    },
    {
      tipo: "scelta",
      chiave: "colonne",
      etichetta: "Colonne della griglia (da computer)",
      opzioni: [
        { valore: 2, etichetta: "2 colonne" },
        { valore: 3, etichetta: "3 colonne" },
        { valore: 4, etichetta: "4 colonne" },
      ],
    },
    {
      tipo: "booleano",
      chiave: "scorrimentoAutomatico",
      etichetta: "Carosello: scorrimento automatico",
    },
    {
      tipo: "elenco",
      chiave: "immagini",
      etichetta: "Immagini",
      etichettaElemento: "immagine",
      campi: [
        { tipo: "immagine", chiave: "url", etichetta: "Immagine", obbligatorio: true },
        { tipo: "testo", chiave: "alt", etichetta: "Descrizione per chi non vede l'immagine", obbligatorio: true },
        { tipo: "testo", chiave: "didascalia", etichetta: "Didascalia" },
      ],
    },
  ],
  testimonianze: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    {
      tipo: "elenco",
      chiave: "elementi",
      etichetta: "Testimonianze",
      aiuto: "Solo testimonianze reali, con il consenso di chi le ha scritte.",
      etichettaElemento: "testimonianza",
      campi: [
        { tipo: "testo-lungo", chiave: "testo", etichetta: "Testo", obbligatorio: true },
        { tipo: "testo", chiave: "nome", etichetta: "Nome", obbligatorio: true },
        { tipo: "testo", chiave: "dettaglio", etichetta: "Dettaglio (es. città)" },
      ],
    },
  ],
  autore: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo della sezione" },
    { tipo: "testo", chiave: "nome", etichetta: "Nome", obbligatorio: true },
    { tipo: "testo", chiave: "ruolo", etichetta: "Ruolo", obbligatorio: true },
    { tipo: "testo", chiave: "luogo", etichetta: "Luogo" },
    { tipo: "immagine", chiave: "fotoUrl", etichetta: "Foto", aiuto: "Quadrata, almeno 400×400 px." },
    { tipo: "elenco-testi", chiave: "paragrafi", etichetta: "Paragrafi", etichettaElemento: "paragrafo" },
  ],
  faq: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    {
      tipo: "elenco",
      chiave: "domande",
      etichetta: "Domande",
      etichettaElemento: "domanda",
      campi: [
        { tipo: "testo", chiave: "domanda", etichetta: "Domanda", obbligatorio: true },
        { tipo: "testo-lungo", chiave: "risposta", etichetta: "Risposta", obbligatorio: true },
      ],
    },
  ],
  prezzo: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
    { tipo: "testo-lungo", chiave: "sottotitolo", etichetta: "Sottotitolo" },
    {
      tipo: "elenco-testi",
      chiave: "garanzie",
      etichetta: "Garanzie",
      aiuto: "Il prezzo e i contenuti inclusi vengono dalla scheda della guida.",
      etichettaElemento: "garanzia",
    },
  ],
  invito: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
    { tipo: "testo-lungo", chiave: "testo", etichetta: "Testo" },
    {
      tipo: "scelta",
      chiave: "azione",
      etichetta: "Pulsante",
      opzioni: [
        { valore: "acquista", etichetta: "Acquista la guida" },
        { valore: "accedi", etichetta: "Accedi all'area riservata" },
      ],
    },
  ],
};

/** Ordine dei blocchi nel menu "Aggiungi blocco". */
export const ORDINE_BLOCCHI: TipoBlocco[] = [
  "hero",
  "punti-chiave",
  "tappe",
  "testo",
  "immagine",
  "video",
  "galleria",
  "testimonianze",
  "autore",
  "faq",
  "prezzo",
  "invito",
];

/** Contenuto iniziale di un blocco appena aggiunto. */
export const BLOCCHI_NUOVI: Record<TipoBlocco, Record<string, unknown>> = {
  hero: { titolo: "", evidenza: "", sottotitolo: "", numeri: [] },
  "punti-chiave": { titolo: "", punti: [{ icona: "sicurezza", titolo: "", testo: "" }] },
  tappe: { titolo: "Cosa trovi nella guida", tappe: [{ titolo: "", testo: "" }] },
  testo: { titolo: "", paragrafi: [""] },
  immagine: { url: "", alt: "" },
  video: {
    titolo: "",
    indirizzo: "",
    formato: "16:9",
    avvioAutomatico: false,
    muto: false,
    ripeti: false,
    controlli: true,
    sottotitoli: false,
    pulsanteAcquisto: false,
  },
  galleria: { titolo: "", modalita: "griglia", colonne: 3, scorrimentoAutomatico: false, immagini: [] },
  testimonianze: { titolo: "Cosa dicono i lettori", elementi: [] },
  autore: { titolo: "Chi ha scritto la guida", nome: "Guido Contesini", ruolo: "", paragrafi: [""] },
  faq: { titolo: "Domande frequenti", domande: [{ domanda: "", risposta: "" }] },
  prezzo: {
    titolo: "Una vendita buona e giusta",
    garanzie: ["Pagamento sicuro con Stripe", "Accesso immediato dopo il pagamento"],
  },
  invito: { titolo: "", azione: "acquista" },
};

/** Elemento vuoto di un elenco, con i campi dello schema. */
export function elementoVuoto(campi: Campo[]) {
  return Object.fromEntries(
    campi.map((c) => [
      c.chiave,
      c.tipo === "booleano" ? false : c.tipo === "scelta" ? c.opzioni[0]?.valore : "",
    ]),
  );
}

/** Identificativo breve per un nuovo blocco (usato anche come ancora nella pagina). */
export function nuovoIdBlocco(tipo: TipoBlocco) {
  return `${tipo}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Slug a partire da un titolo: "Vendere casa, guida!" → "vendere-casa-guida". */
export function slugDaTitolo(titolo: string) {
  return titolo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}
