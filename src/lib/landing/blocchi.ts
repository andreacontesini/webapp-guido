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
  /** Identificativo stabile del blocco (serve all'editor della Fase 9). */
  id?: string;
};

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
};

export type BloccoPuntiChiave = Base & {
  tipo: "punti-chiave";
  titolo: string;
  sottotitolo?: string;
  punti: { icona: IconaPunto; titolo: string; testo: string }[];
};

export type BloccoTappe = Base & {
  tipo: "tappe";
  titolo: string;
  sottotitolo?: string;
  tappe: { titolo: string; testo: string }[];
};

export type BloccoTesto = Base & {
  tipo: "testo";
  titolo?: string;
  paragrafi: string[];
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
};

export type BloccoInvito = Base & {
  tipo: "invito";
  titolo: string;
  testo?: string;
  /** "acquista" apre il popup di acquisto, "accedi" porta alla pagina di accesso. */
  azione: "acquista" | "accedi";
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
  /** Pulsante "Acquista" sotto il video. */
  pulsanteAcquisto: boolean;
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
  | BloccoGalleria;

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
      return {
        tipo: "hero",
        id,
        etichetta: testo(o.etichetta),
        titolo,
        evidenza: testo(o.evidenza),
        sottotitolo,
        nota: testo(o.nota),
        numeri,
      };
    }
    case "punti-chiave": {
      const titolo = testo(o.titolo);
      const punti = elenco(o.punti, (p) => {
        const base = coppia(p);
        return base ? { ...base, icona: isIconaPunto(p.icona) ? p.icona : "metodo" } : null;
      });
      if (!titolo || punti.length === 0) return null;
      return { tipo: "punti-chiave", id, titolo, sottotitolo: testo(o.sottotitolo), punti };
    }
    case "tappe": {
      const titolo = testo(o.titolo);
      const tappe = elenco(o.tappe, coppia);
      if (!titolo || tappe.length === 0) return null;
      return { tipo: "tappe", id, titolo, sottotitolo: testo(o.sottotitolo), tappe };
    }
    case "testo": {
      const paragrafi = testi(o.paragrafi);
      if (paragrafi.length === 0) return null;
      return { tipo: "testo", id, titolo: testo(o.titolo), paragrafi };
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
      };
    }
    case "invito": {
      const titolo = testo(o.titolo);
      if (!titolo || (o.azione !== "acquista" && o.azione !== "accedi")) return null;
      return { tipo: "invito", id, titolo, testo: testo(o.testo), azione: o.azione };
    }
    case "video": {
      const indirizzo = testo(o.indirizzo);
      if (!indirizzo || !analizzaVideo(indirizzo)) return null;
      const formato = (FORMATI_VIDEO as readonly unknown[]).includes(o.formato)
        ? (o.formato as FormatoVideo)
        : "16:9";
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
        pulsanteAcquisto: o.pulsanteAcquisto === true,
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
    default:
      return null;
  }
}

/** True se il blocco (JSON grezzo) è completo e verrà mostrato nella pagina. */
export function isBloccoValido(valore: unknown) {
  return isOggetto(valore) && normalizzaBlocco(valore) !== null;
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
  return elenco(valore, normalizzaBlocco);
}

/** True se la landing contiene almeno un punto da cui si acquista. */
export function haAcquisto(blocchi: Blocco[]) {
  return blocchi.some(
    (b) => b.tipo === "hero" || b.tipo === "prezzo" || (b.tipo === "invito" && b.azione === "acquista"),
  );
}
