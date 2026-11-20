/**
 * Blocchi predefiniti delle landing di vendita.
 * Una landing è un elenco ordinato di blocchi salvato come JSON nella colonna
 * `landing_pages.blocks`; ogni blocco viene disegnato con lo stile dell'app
 * dai componenti in `src/components/landing/`.
 *
 * Il JSON arriva dal database, quindi prima dell'uso passa da
 * `normalizzaBlocchi`, che scarta i blocchi non riconosciuti o incompleti.
 */

/** Icone disponibili per i punti chiave (nome → componente in `icone-landing.tsx`). */
export const ICONE_PUNTI = [
  "sicurezza",
  "metodo",
  "valore",
  "costi",
  "documenti",
  "tempo",
  "casa",
  "dialogo",
] as const;
export type IconaPunto = (typeof ICONE_PUNTI)[number];

type Base = {
  /** Identificativo stabile del blocco (serve all'editor della Fase 11). */
  id?: string;
};

/**
 * Pulsante configurabile dall'editor: cosa c'è scritto e cosa fa.
 * - `acquista`: apre il pagamento della guida;
 * - `sezione`: scorre a un blocco della pagina (es. il modulo di contatto);
 * - `link`: apre un indirizzo (https, percorso interno, mailto: o tel:);
 * - `accedi`: porta all'accesso all'area riservata.
 */
export const AZIONI_PULSANTE = ["acquista", "sezione", "link", "accedi"] as const;
export type AzionePulsante = (typeof AZIONI_PULSANTE)[number];
export const STILI_PULSANTE = ["principale", "secondario"] as const;
export type StilePulsante = (typeof STILI_PULSANTE)[number];

export type Pulsante = {
  etichetta: string;
  azione: AzionePulsante;
  /** Id del blocco di destinazione (azione `sezione`). */
  sezione?: string;
  /** Indirizzo (azione `link`). */
  link?: string;
  stile: StilePulsante;
};

/** Cosa mostra l'apertura a fianco del testo. */
export const MEDIA_HERO = ["guida", "immagine", "video", "nessuno"] as const;
export type MediaHero = (typeof MEDIA_HERO)[number];

export type BloccoHero = Base & {
  tipo: "hero";
  /** Etichetta breve sopra il titolo (es. "Guida pratica · 18 pagine"). */
  etichetta?: string;
  titolo: string;
  /** Seconda parte del titolo, evidenziata nel colore principale. */
  evidenza?: string;
  sottotitolo: string;
  /** Riga sotto il pulsante (es. accesso immediato). */
  nota?: string;
  /** Numeri chiave: solo dati reali. */
  numeri?: { valore: string; etichetta: string }[];
  pulsante?: Pulsante;
  pulsanteSecondario?: Pulsante;
  media: MediaHero;
  immagineUrl?: string;
  immagineAlt?: string;
  videoUrl?: string;
  videoCopertina?: string;
  videoFormato: FormatoVideo;
};

export type BloccoPuntiChiave = Base & {
  tipo: "punti-chiave";
  titolo: string;
  sottotitolo?: string;
  punti: { icona: IconaPunto; titolo: string; testo: string }[];
  pulsante?: Pulsante;
};

export type BloccoTappe = Base & {
  tipo: "tappe";
  titolo: string;
  sottotitolo?: string;
  tappe: { titolo: string; testo: string }[];
  pulsante?: Pulsante;
};

export type BloccoTesto = Base & {
  tipo: "testo";
  titolo?: string;
  paragrafi: string[];
  pulsante?: Pulsante;
};

export type BloccoImmagine = Base & {
  tipo: "immagine";
  url: string;
  alt: string;
  didascalia?: string;
};

export type BloccoTestimonianze = Base & {
  tipo: "testimonianze";
  titolo?: string;
  /** Solo testimonianze reali, con il consenso di chi le ha scritte. */
  elementi: { testo: string; nome: string; dettaglio?: string }[];
};

export type BloccoAutore = Base & {
  tipo: "autore";
  titolo?: string;
  nome: string;
  ruolo: string;
  paragrafi: string[];
  luogo?: string;
  fotoUrl?: string;
  pulsante?: Pulsante;
};

export type BloccoFaq = Base & {
  tipo: "faq";
  titolo?: string;
  domande: { domanda: string; risposta: string }[];
};

export type BloccoPrezzo = Base & {
  tipo: "prezzo";
  titolo: string;
  sottotitolo?: string;
  /** Rassicurazioni sotto il pulsante (pagamento sicuro, accesso immediato…). */
  garanzie: string[];
  /** Testo del pulsante di acquisto (predefinito: "Acquista la guida"). */
  etichettaPulsante?: string;
};

export type BloccoInvito = Base & {
  tipo: "invito";
  titolo: string;
  testo?: string;
  pulsante: Pulsante;
};

/** Formati del riquadro video (larghezza:altezza). */
export const FORMATI_VIDEO = ["16:9", "9:16", "1:1"] as const;
export type FormatoVideo = (typeof FORMATI_VIDEO)[number];

export type BloccoVideo = Base & {
  tipo: "video";
  titolo?: string;
  testo?: string;
  /**
   * Indirizzo del video: Bunny Stream (link di embed o di riproduzione),
   * YouTube, Vimeo o file MP4/WebM in https. La sorgente si riconosce da qui.
   */
  indirizzo: string;
  /** Immagine mostrata prima della riproduzione (consigliata, 16:9 o come il formato). */
  copertinaUrl?: string;
  formato: FormatoVideo;
  /** Parte da solo quando entra nello schermo (sempre senza audio, regola dei browser). */
  avvioAutomatico: boolean;
  /** Audio disattivato all'avvio. */
  muto: boolean;
  ripeti: boolean;
  /** Controlli del player visibili. */
  controlli: boolean;
  /** Sottotitoli attivi se il video li ha. */
  sottotitoli: boolean;
  /** Secondo da cui parte la riproduzione. */
  inizio?: number;
  /** Pulsante facoltativo sotto il video. */
  pulsante?: Pulsante;
};

export const MODALITA_GALLERIA = ["griglia", "carosello"] as const;
export type ModalitaGalleria = (typeof MODALITA_GALLERIA)[number];

export type BloccoGalleria = Base & {
  tipo: "galleria";
  titolo?: string;
  modalita: ModalitaGalleria;
  /** Colonne della griglia su desktop (una sola su smartphone). */
  colonne: 2 | 3 | 4;
  /** Solo carosello: scorre da solo ogni pochi secondi. */
  scorrimentoAutomatico: boolean;
  immagini: { url: string; alt: string; didascalia?: string }[];
};

export const SIMBOLI_ELENCO = ["spunta", "croce", "domanda"] as const;
export type SimboloElenco = (typeof SIMBOLI_ELENCO)[number];

export type BloccoElenco = Base & {
  tipo: "elenco";
  titolo?: string;
  testo?: string;
  voci: string[];
  simbolo: SimboloElenco;
  pulsante?: Pulsante;
};

/** Campi che il modulo di contatto può chiedere (nome → etichetta predefinita). */
export const CAMPI_CONTATTO = {
  nome: "Nome e cognome",
  email: "Email",
  telefono: "Telefono",
  citta: "Città",
  messaggio: "Messaggio",
} as const;
export type CampoContatto = keyof typeof CAMPI_CONTATTO;
export const codiciCampiContatto = Object.keys(CAMPI_CONTATTO) as CampoContatto[];

export type BloccoModulo = Base & {
  tipo: "modulo";
  titolo?: string;
  testo?: string;
  /** Campi nell'ordine scelto, senza doppioni. Almeno email o telefono. */
  campi: { campo: CampoContatto; etichetta: string; obbligatorio: boolean }[];
  etichettaInvio: string;
  messaggioConferma: string;
  /** Email che ricevono le richieste di questo modulo (oltre all'evento "Richieste landing"). */
  destinatari: string[];
};

export type Blocco =
  | BloccoHero
  | BloccoPuntiChiave
  | BloccoTappe
  | BloccoTesto
  | BloccoImmagine
  | BloccoTestimonianze
  | BloccoAutore
  | BloccoFaq
  | BloccoPrezzo
  | BloccoInvito
  | BloccoVideo
  | BloccoGalleria
  | BloccoElenco
  | BloccoModulo;

export type TipoBlocco = Blocco["tipo"];

/** Nomi dei blocchi in italiano, per l'admin. */
export const NOMI_BLOCCHI: Record<TipoBlocco, string> = {
  hero: "Apertura (hero)",
  "punti-chiave": "Punti chiave",
  tappe: "Contenuti della guida (tappe)",
  testo: "Testo libero",
  immagine: "Immagine",
  testimonianze: "Testimonianze",
  autore: "Chi è l'autore",
  faq: "Domande frequenti",
  prezzo: "Prezzo e acquisto",
  invito: "Invito (acquisto o accesso)",
  video: "Video",
  galleria: "Galleria immagini",
  elenco: "Elenco",
  modulo: "Modulo di contatto",
};

// -------------------------------------------------------------
// Validazione del JSON letto dal database
// -------------------------------------------------------------

type Oggetto = Record<string, unknown>;

const isOggetto = (v: unknown): v is Oggetto =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Testo non vuoto, ripulito; `undefined` se assente o non valido. */
const testo = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** Elenco di testi non vuoti. */
const testi = (v: unknown) =>
  Array.isArray(v) ? v.map(testo).filter((t): t is string => t !== undefined) : [];

/** Elenco di oggetti, ciascuno convertito con `converti` (gli scarti sono `null`). */
function elenco<T>(v: unknown, converti: (o: Oggetto) => T | null): T[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((o) => {
    if (!isOggetto(o)) return [];
    const convertito = converti(o);
    return convertito === null ? [] : [convertito];
  });
}

/** Accetta solo indirizzi https (o percorsi interni) per immagini. */
const url = (v: unknown) => {
  const t = testo(v);
  if (!t) return undefined;
  return t.startsWith("https://") || (t.startsWith("/") && !t.startsWith("//")) ? t : undefined;
};

const coppia = (o: Oggetto) => {
  const titolo = testo(o.titolo);
  const descrizione = testo(o.testo);
  return titolo && descrizione ? { titolo, testo: descrizione } : null;
};

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Destinazione di un link: https, percorso interno, mailto: o tel:. */
export function isLinkValido(v: string) {
  return (
    v.startsWith("https://") ||
    (v.startsWith("/") && !v.startsWith("//")) ||
    /^mailto:[^\s@]+@[^\s@]+$/.test(v) ||
    /^tel:\+?[0-9 ().-]{5,20}$/.test(v)
  );
}

/**
 * Pulsante dal JSON. I pulsanti facoltativi valgono solo con `attivo: true`;
 * `undefined` se assente, spento o incompleto.
 */
function pulsante(v: unknown, facoltativo = true): Pulsante | undefined {
  if (!isOggetto(v)) return undefined;
  if (facoltativo && v.attivo !== true) return undefined;
  const etichetta = testo(v.etichetta);
  const azione = (AZIONI_PULSANTE as readonly unknown[]).includes(v.azione) ? (v.azione as AzionePulsante) : undefined;
  if (!etichetta || !azione) return undefined;
  const stile: StilePulsante = v.stile === "secondario" ? "secondario" : "principale";
  if (azione === "sezione") {
    const sezione = testo(v.sezione);
    return sezione ? { etichetta, azione, sezione, stile } : undefined;
  }
  if (azione === "link") {
    const link = testo(v.link);
    return link && isLinkValido(link) ? { etichetta, azione, link, stile } : undefined;
  }
  return { etichetta, azione, stile };
}

const isIconaPunto = (v: unknown): v is IconaPunto =>
  typeof v === "string" && (ICONE_PUNTI as readonly string[]).includes(v);

/** Converte un singolo blocco; `null` se non è valido. */
function normalizzaBlocco(o: Oggetto): Blocco | null {
  const id = testo(o.id);

  switch (o.tipo) {
    case "hero": {
      const titolo = testo(o.titolo);
      const sottotitolo = testo(o.sottotitolo);
      if (!titolo || !sottotitolo) return null;
      const numeri = elenco(o.numeri, (n) => {
        const valore = testo(n.valore);
        const etichetta = testo(n.etichetta);
        return valore && etichetta ? { valore, etichetta } : null;
      });
      const media = (MEDIA_HERO as readonly unknown[]).includes(o.media) ? (o.media as MediaHero) : "guida";
      return {
        tipo: "hero",
        id,
        etichetta: testo(o.etichetta),
        titolo,
        evidenza: testo(o.evidenza),
        sottotitolo,
        nota: testo(o.nota),
        numeri,
        pulsante: pulsante(o.pulsante),
        pulsanteSecondario: pulsante(o.pulsanteSecondario),
        media,
        immagineUrl: url(o.immagineUrl),
        immagineAlt: testo(o.immagineAlt),
        videoUrl: testo(o.videoUrl) && analizzaVideo(testo(o.videoUrl)!) ? testo(o.videoUrl) : undefined,
        videoCopertina: url(o.videoCopertina),
        videoFormato: formatoVideo(o.videoFormato),
      };
    }
    case "punti-chiave": {
      const titolo = testo(o.titolo);
      const punti = elenco(o.punti, (p) => {
        const base = coppia(p);
        return base ? { ...base, icona: isIconaPunto(p.icona) ? p.icona : "metodo" } : null;
      });
      if (!titolo || punti.length === 0) return null;
      return { tipo: "punti-chiave", id, titolo, sottotitolo: testo(o.sottotitolo), punti, pulsante: pulsante(o.pulsante) };
    }
    case "tappe": {
      const titolo = testo(o.titolo);
      const tappe = elenco(o.tappe, coppia);
      if (!titolo || tappe.length === 0) return null;
      return { tipo: "tappe", id, titolo, sottotitolo: testo(o.sottotitolo), tappe, pulsante: pulsante(o.pulsante) };
    }
    case "testo": {
      const paragrafi = testi(o.paragrafi);
      if (paragrafi.length === 0) return null;
      return { tipo: "testo", id, titolo: testo(o.titolo), paragrafi, pulsante: pulsante(o.pulsante) };
    }
    case "immagine": {
      const indirizzo = url(o.url);
      const alt = testo(o.alt);
      if (!indirizzo || !alt) return null;
      return { tipo: "immagine", id, url: indirizzo, alt, didascalia: testo(o.didascalia) };
    }
    case "testimonianze": {
      const elementi = elenco(o.elementi, (e) => {
        const frase = testo(e.testo);
        const nome = testo(e.nome);
        return frase && nome ? { testo: frase, nome, dettaglio: testo(e.dettaglio) } : null;
      });
      if (elementi.length === 0) return null;
      return { tipo: "testimonianze", id, titolo: testo(o.titolo), elementi };
    }
    case "autore": {
      const nome = testo(o.nome);
      const ruolo = testo(o.ruolo);
      const paragrafi = testi(o.paragrafi);
      if (!nome || !ruolo || paragrafi.length === 0) return null;
      return {
        tipo: "autore",
        id,
        titolo: testo(o.titolo),
        nome,
        ruolo,
        paragrafi,
        luogo: testo(o.luogo),
        fotoUrl: url(o.fotoUrl),
        pulsante: pulsante(o.pulsante),
      };
    }
    case "faq": {
      const domande = elenco(o.domande, (d) => {
        const domanda = testo(d.domanda);
        const risposta = testo(d.risposta);
        return domanda && risposta ? { domanda, risposta } : null;
      });
      if (domande.length === 0) return null;
      return { tipo: "faq", id, titolo: testo(o.titolo), domande };
    }
    case "prezzo": {
      const titolo = testo(o.titolo);
      if (!titolo) return null;
      return {
        tipo: "prezzo",
        id,
        titolo,
        sottotitolo: testo(o.sottotitolo),
        garanzie: testi(o.garanzie),
        etichettaPulsante: testo(o.etichettaPulsante),
      };
    }
    case "invito": {
      const titolo = testo(o.titolo);
      const azione = pulsante(o.pulsante, false);
      if (!titolo || !azione) return null;
      return { tipo: "invito", id, titolo, testo: testo(o.testo), pulsante: azione };
    }
    case "video": {
      const indirizzo = testo(o.indirizzo);
      if (!indirizzo || !analizzaVideo(indirizzo)) return null;
      const formato = formatoVideo(o.formato);
      const inizio = Number(o.inizio);
      const avvioAutomatico = o.avvioAutomatico === true;
      return {
        tipo: "video",
        id,
        titolo: testo(o.titolo),
        testo: testo(o.testo),
        indirizzo,
        copertinaUrl: url(o.copertinaUrl),
        formato,
        avvioAutomatico,
        // L'avvio automatico funziona solo senza audio.
        muto: avvioAutomatico || o.muto === true,
        ripeti: o.ripeti === true,
        controlli: o.controlli !== false,
        sottotitoli: o.sottotitoli === true,
        inizio: Number.isFinite(inizio) && inizio > 0 ? Math.floor(inizio) : undefined,
        pulsante: pulsante(o.pulsante),
      };
    }
    case "galleria": {
      const immagini = elenco(o.immagini, (i) => {
        const indirizzo = url(i.url);
        const alt = testo(i.alt);
        return indirizzo && alt ? { url: indirizzo, alt, didascalia: testo(i.didascalia) } : null;
      });
      if (immagini.length === 0) return null;
      const colonne = Number(o.colonne);
      return {
        tipo: "galleria",
        id,
        titolo: testo(o.titolo),
        modalita: o.modalita === "carosello" ? "carosello" : "griglia",
        colonne: colonne === 2 || colonne === 4 ? colonne : 3,
        scorrimentoAutomatico: o.scorrimentoAutomatico === true,
        immagini,
      };
    }
    case "elenco": {
      const voci = testi(o.voci);
      if (voci.length === 0) return null;
      const simbolo = (SIMBOLI_ELENCO as readonly unknown[]).includes(o.simbolo)
        ? (o.simbolo as SimboloElenco)
        : "spunta";
      return {
        tipo: "elenco",
        id,
        titolo: testo(o.titolo),
        testo: testo(o.testo),
        voci,
        simbolo,
        pulsante: pulsante(o.pulsante),
      };
    }
    case "modulo": {
      const visti = new Set<string>();
      const campi = elenco(o.campi, (c) => {
        const campo = c.campo;
        if (typeof campo !== "string" || !(campo in CAMPI_CONTATTO) || visti.has(campo)) return null;
        visti.add(campo);
        return {
          campo: campo as CampoContatto,
          etichetta: testo(c.etichetta) ?? CAMPI_CONTATTO[campo as CampoContatto],
          obbligatorio: c.obbligatorio === true,
        };
      });
      // Senza email né telefono non si può ricontattare chi scrive.
      if (!visti.has("email") && !visti.has("telefono")) return null;
      return {
        tipo: "modulo",
        id,
        titolo: testo(o.titolo),
        testo: testo(o.testo),
        campi,
        etichettaInvio: testo(o.etichettaInvio) ?? "Invia",
        messaggioConferma:
          testo(o.messaggioConferma) ?? "Grazie! Abbiamo ricevuto la tua richiesta e ti ricontatteremo presto.",
        destinatari: testi(o.destinatari)
          .map((e) => e.toLowerCase())
          .filter((e, i, tutte) => formatoEmail.test(e) && tutte.indexOf(e) === i)
          .slice(0, 10),
      };
    }
    default:
      return null;
  }
}

const formatoVideo = (v: unknown): FormatoVideo =>
  (FORMATI_VIDEO as readonly unknown[]).includes(v) ? (v as FormatoVideo) : "16:9";

/**
 * Porta un blocco salvato prima dei pulsanti configurabili (v0.12.0) al
 * formato attuale, senza cambiarne l'aspetto: l'apertura con "Acquista" e
 * "Scopri cosa contiene", l'invito con la vecchia `azione`, il video con
 * `pulsanteAcquisto`. Usata dalla pagina pubblica e dall'editor.
 */
export function aggiornaFormatoBlocco(o: Record<string, unknown>, tutti: unknown[]): Record<string, unknown> {
  switch (o.tipo) {
    case "hero": {
      if ("pulsante" in o) return o;
      const tappe = tutti.find((b) => isOggetto(b) && b.tipo === "tappe" && typeof b.id === "string") as
        | Oggetto
        | undefined;
      return {
        ...o,
        media: o.media ?? "guida",
        pulsante: { attivo: true, etichetta: "Acquista la guida", azione: "acquista", stile: "principale" },
        pulsanteSecondario: tappe
          ? { attivo: true, etichetta: "Scopri cosa contiene", azione: "sezione", sezione: tappe.id, stile: "secondario" }
          : { attivo: false, etichetta: "", azione: "sezione", stile: "secondario" },
      };
    }
    case "invito": {
      if ("pulsante" in o) return o;
      const accedi = o.azione === "accedi";
      const { azione: _vecchia, ...resto } = o;
      void _vecchia;
      return {
        ...resto,
        pulsante: accedi
          ? { attivo: true, etichetta: "Accedi alla tua area", azione: "accedi", stile: "secondario" }
          : { attivo: true, etichetta: "Acquista la guida", azione: "acquista", stile: "principale" },
      };
    }
    case "video": {
      if ("pulsante" in o) return o;
      const { pulsanteAcquisto, ...resto } = o;
      return {
        ...resto,
        pulsante: { attivo: pulsanteAcquisto === true, etichetta: "Acquista la guida", azione: "acquista", stile: "principale" },
      };
    }
    default:
      return o;
  }
}

/** Blocchi (JSON grezzo) nel formato attuale: vedi `aggiornaFormatoBlocco`. */
export function aggiornaFormatoBlocchi(valore: unknown): unknown[] {
  if (!Array.isArray(valore)) return [];
  return valore.map((b) => (isOggetto(b) ? aggiornaFormatoBlocco(b, valore) : b));
}

/** True se il blocco (JSON grezzo, già nel formato attuale) è completo e verrà mostrato nella pagina. */
export function isBloccoValido(valore: unknown) {
  return isOggetto(valore) && normalizzaBlocco(valore) !== null;
}

/** Blocco normalizzato dal JSON grezzo, o `null` (usato dal server per il modulo di contatto). */
export function normalizzaUnBlocco(valore: unknown, tutti: unknown[] = []): Blocco | null {
  return isOggetto(valore) ? normalizzaBlocco(aggiornaFormatoBlocco(valore, tutti)) : null;
}

// -------------------------------------------------------------
// Video: riconoscimento della sorgente dall'indirizzo
// -------------------------------------------------------------

export type SorgenteVideo =
  | { tipo: "bunny"; libreria: string; video: string }
  | { tipo: "youtube"; video: string }
  | { tipo: "vimeo"; video: string; hash?: string }
  | { tipo: "file"; url: string };

/** Riconosce la sorgente di un video dal suo indirizzo; `null` se non supportata. */
export function analizzaVideo(indirizzo: string): SorgenteVideo | null {
  let u: URL;
  try {
    u = new URL(indirizzo);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");
  const parti = u.pathname.split("/").filter(Boolean);

  // Bunny Stream: iframe.mediadelivery.net/{embed|play}/<libreria>/<video>
  if (host === "iframe.mediadelivery.net" || host === "player.mediadelivery.net") {
    const [modo, libreria, video] = parti;
    if ((modo === "embed" || modo === "play") && /^\d+$/.test(libreria ?? "") && video) {
      return { tipo: "bunny", libreria, video };
    }
    return null;
  }

  // YouTube: watch?v=, youtu.be/, /shorts/, /embed/
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const video =
      u.searchParams.get("v") ??
      (["shorts", "embed", "live"].includes(parti[0] ?? "") ? parti[1] : undefined);
    return video && /^[\w-]{6,20}$/.test(video) ? { tipo: "youtube", video } : null;
  }
  if (host === "youtu.be") {
    const video = parti[0];
    return video && /^[\w-]{6,20}$/.test(video) ? { tipo: "youtube", video } : null;
  }

  // Vimeo: vimeo.com/<id>[/<hash>] o player.vimeo.com/video/<id>?h=<hash>
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const indice = parti[0] === "video" ? 1 : 0;
    const video = parti[indice];
    if (!video || !/^\d+$/.test(video)) return null;
    const hash = u.searchParams.get("h") ?? parti[indice + 1];
    return { tipo: "vimeo", video, hash: hash && /^[\da-f]+$/i.test(hash) ? hash : undefined };
  }

  // File video diretto (es. Storage o CDN).
  if (/\.(mp4|webm|m4v)$/i.test(u.pathname)) return { tipo: "file", url: u.toString() };

  return null;
}

/** Blocchi validi di una landing, nell'ordine salvato. */
export function normalizzaBlocchi(valore: unknown): Blocco[] {
  return elenco(aggiornaFormatoBlocchi(valore), normalizzaBlocco);
}

/**
 * Barra fissa in basso su smartphone (colonna `landing_pages.mobile_bar`):
 * - `predefinita`: landing salvate prima della v0.12.0, barra di acquisto se la landing vende la guida;
 * - `spenta`: nessuna barra;
 * - `personalizzata`: titolo, testo e pulsante scelti nell'editor.
 */
export type BarraFissa =
  | { modo: "predefinita" }
  | { modo: "spenta" }
  | { modo: "personalizzata"; titolo?: string; testo?: string; pulsante: Pulsante };

export function normalizzaBarra(v: unknown): BarraFissa {
  if (!isOggetto(v)) return { modo: "predefinita" };
  if (v.attiva !== true) return { modo: "spenta" };
  const azione = pulsante(v.pulsante, false);
  return azione
    ? { modo: "personalizzata", titolo: testo(v.titolo), testo: testo(v.testo), pulsante: azione }
    : { modo: "spenta" };
}

/** Tutti i pulsanti configurati nei blocchi. */
export function pulsantiDi(blocchi: Blocco[]): Pulsante[] {
  return blocchi.flatMap((b) => {
    switch (b.tipo) {
      case "hero":
        return [b.pulsante, b.pulsanteSecondario].filter((p): p is Pulsante => p !== undefined);
      case "invito":
        return [b.pulsante];
      case "punti-chiave":
      case "tappe":
      case "testo":
      case "autore":
      case "video":
      case "elenco":
        return b.pulsante ? [b.pulsante] : [];
      default:
        return [];
    }
  });
}

/** True se la landing contiene almeno un punto da cui si acquista la guida. */
export function haAcquisto(blocchi: Blocco[]) {
  return blocchi.some((b) => b.tipo === "prezzo") || pulsantiDi(blocchi).some((p) => p.azione === "acquista");
}
