/**
 * Schema dell'editor delle landing: per ogni tipo di blocco, i campi da
 * mostrare nel modulo e il contenuto iniziale di un blocco nuovo.
 * Le chiavi dei campi coincidono con quelle del JSON salvato (vedi
 * `src/lib/landing/blocchi.ts`), quindi l'editor modifica il JSON così com'è.
 */
import {
  CAMPI_CONTATTO,
  codiciCampiContatto,
  FORMATI_VIDEO,
  ICONE_PUNTI,
  type IconaPunto,
  type TipoBlocco,
} from "@/lib/landing/blocchi";

type Comune = {
  chiave: string;
  etichetta: string;
  aiuto?: string;
  obbligatorio?: boolean;
  /** Il campo compare solo se un altro campo del blocco ha uno di questi valori. */
  quando?: { chiave: string; valori: unknown[] };
};

export type Campo =
  | (Comune & { tipo: "testo" })
  | (Comune & { tipo: "video" })
  /** Pulsante configurabile; `facoltativo`: con la casella "Mostra il pulsante". */
  | (Comune & { tipo: "pulsante"; facoltativo?: boolean })
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
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante principale", facoltativo: true },
    { tipo: "pulsante", chiave: "pulsanteSecondario", etichetta: "Pulsante secondario", facoltativo: true },
    { tipo: "testo", chiave: "nota", etichetta: "Nota sotto i pulsanti" },
    {
      tipo: "scelta",
      chiave: "media",
      etichetta: "A fianco del testo",
      opzioni: [
        { valore: "guida", etichetta: "Copertina della guida" },
        { valore: "immagine", etichetta: "Immagine" },
        { valore: "video", etichetta: "Video (parte da solo, senza audio)" },
        { valore: "nessuno", etichetta: "Niente" },
      ],
    },
    { tipo: "immagine", chiave: "immagineUrl", etichetta: "Immagine", quando: { chiave: "media", valori: ["immagine"] } },
    {
      tipo: "testo",
      chiave: "immagineAlt",
      etichetta: "Descrizione dell'immagine per chi non vede",
      quando: { chiave: "media", valori: ["immagine"] },
    },
    {
      tipo: "video",
      chiave: "videoUrl",
      etichetta: "Video",
      aiuto: "Carica un file MP4 fino a 10 MB oppure incolla un link di Bunny Stream, YouTube o Vimeo.",
      quando: { chiave: "media", valori: ["video"] },
    },
    {
      tipo: "immagine",
      chiave: "videoCopertina",
      etichetta: "Copertina del video",
      aiuto: "Mostrata finché il video non parte.",
      quando: { chiave: "media", valori: ["video"] },
    },
    {
      tipo: "scelta",
      chiave: "videoFormato",
      etichetta: "Formato del video",
      opzioni: [
        { valore: "16:9", etichetta: "16:9 orizzontale" },
        { valore: "1:1", etichetta: "1:1 quadrato" },
        { valore: "9:16", etichetta: "9:16 verticale" },
      ],
      quando: { chiave: "media", valori: ["video"] },
    },
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
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante sotto il blocco", facoltativo: true },
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
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante sotto il blocco", facoltativo: true },
  ],
  testo: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    { tipo: "elenco-testi", chiave: "paragrafi", etichetta: "Paragrafi", etichettaElemento: "paragrafo" },
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante sotto il blocco", facoltativo: true },
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
      tipo: "video",
      chiave: "indirizzo",
      etichetta: "Video",
      obbligatorio: true,
      aiuto:
        "Carica un file MP4/WebM fino a 10 MB oppure incolla un link di Bunny Stream (consigliato per video lunghi), YouTube o Vimeo.",
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
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante sotto il blocco", facoltativo: true },
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
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante sotto il testo", facoltativo: true },
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
    {
      tipo: "testo",
      chiave: "etichettaPulsante",
      etichetta: "Testo del pulsante di acquisto",
      aiuto: "Se vuoto: «Acquista la guida».",
    },
  ],
  invito: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo", obbligatorio: true },
    { tipo: "testo-lungo", chiave: "testo", etichetta: "Testo" },
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante" },
  ],
  elenco: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    { tipo: "testo-lungo", chiave: "testo", etichetta: "Testo introduttivo" },
    {
      tipo: "scelta",
      chiave: "simbolo",
      etichetta: "Simbolo accanto alle voci",
      opzioni: [
        { valore: "spunta", etichetta: "Spunta (sì)" },
        { valore: "croce", etichetta: "Croce (no)" },
        { valore: "domanda", etichetta: "Punto di domanda" },
      ],
    },
    { tipo: "elenco-testi", chiave: "voci", etichetta: "Voci", etichettaElemento: "voce" },
    { tipo: "pulsante", chiave: "pulsante", etichetta: "Pulsante sotto il blocco", facoltativo: true },
  ],
  modulo: [
    { tipo: "testo", chiave: "titolo", etichetta: "Titolo" },
    { tipo: "testo-lungo", chiave: "testo", etichetta: "Testo accanto al modulo" },
    {
      tipo: "elenco",
      chiave: "campi",
      etichetta: "Campi del modulo",
      aiuto: "Nell'ordine in cui compaiono. Serve almeno l'email o il telefono. La casella della privacy c'è sempre.",
      etichettaElemento: "campo",
      campi: [
        {
          tipo: "scelta",
          chiave: "campo",
          etichetta: "Campo",
          opzioni: codiciCampiContatto.map((c) => ({ valore: c, etichetta: CAMPI_CONTATTO[c] })),
        },
        { tipo: "testo", chiave: "etichetta", etichetta: "Etichetta mostrata", aiuto: "Se vuota si usa il nome del campo." },
        { tipo: "booleano", chiave: "obbligatorio", etichetta: "Obbligatorio" },
      ],
    },
    { tipo: "testo", chiave: "etichettaInvio", etichetta: "Testo del pulsante di invio", obbligatorio: true },
    {
      tipo: "testo-lungo",
      chiave: "messaggioConferma",
      etichetta: "Messaggio dopo l'invio",
      obbligatorio: true,
    },
    {
      tipo: "elenco-testi",
      chiave: "destinatari",
      etichetta: "Destinatari delle richieste",
      aiuto:
        "Email che ricevono le richieste di questo modulo. Le ricevono anche i destinatari con l'evento «Richieste landing» in Notifiche.",
      etichettaElemento: "email",
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
  "elenco",
  "prezzo",
  "invito",
  "modulo",
];

/** Pulsante (JSON dell'editor) con i valori predefiniti. */
export const pulsanteNuovo = (dati: Record<string, unknown> = {}) => ({
  attivo: false,
  etichetta: "",
  azione: "acquista",
  sezione: "",
  link: "",
  stile: "principale",
  ...dati,
});

/** Contenuto iniziale di un blocco appena aggiunto. */
export const BLOCCHI_NUOVI: Record<TipoBlocco, Record<string, unknown>> = {
  hero: {
    titolo: "",
    evidenza: "",
    sottotitolo: "",
    numeri: [],
    pulsante: pulsanteNuovo({ attivo: true, etichetta: "Acquista la guida" }),
    pulsanteSecondario: pulsanteNuovo({ azione: "sezione", stile: "secondario" }),
    media: "guida",
    videoFormato: "16:9",
  },
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
    pulsante: pulsanteNuovo({ etichetta: "Acquista la guida" }),
  },
  galleria: { titolo: "", modalita: "griglia", colonne: 3, scorrimentoAutomatico: false, immagini: [] },
  testimonianze: { titolo: "Cosa dicono i lettori", elementi: [] },
  autore: { titolo: "Chi ha scritto la guida", nome: "Guido Contesini", ruolo: "", paragrafi: [""] },
  faq: { titolo: "Domande frequenti", domande: [{ domanda: "", risposta: "" }] },
  prezzo: {
    titolo: "Una vendita buona e giusta",
    garanzie: ["Pagamento sicuro con Stripe", "Accesso immediato dopo il pagamento"],
  },
  invito: { titolo: "", pulsante: pulsanteNuovo({ attivo: true, etichetta: "Acquista la guida" }) },
  elenco: { titolo: "", simbolo: "spunta", voci: [""] },
  modulo: {
    titolo: "Parliamone",
    campi: [
      { campo: "nome", etichetta: "", obbligatorio: true },
      { campo: "email", etichetta: "", obbligatorio: true },
      { campo: "telefono", etichetta: "", obbligatorio: false },
      { campo: "messaggio", etichetta: "", obbligatorio: false },
    ],
    etichettaInvio: "Invia la richiesta",
    messaggioConferma: "Grazie! Abbiamo ricevuto la tua richiesta e ti ricontatteremo presto.",
    destinatari: [],
  },
};

/** Elemento vuoto di un elenco, con i campi dello schema. */
export function elementoVuoto(campi: Campo[]) {
  return Object.fromEntries(
    campi.map((c) => [
      c.chiave,
      c.tipo === "booleano"
        ? false
        : c.tipo === "scelta"
          ? c.opzioni[0]?.valore
          : c.tipo === "pulsante"
            ? pulsanteNuovo()
            : "",
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
