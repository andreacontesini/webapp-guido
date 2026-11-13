/**
 * Catalogo delle notifiche agli admin (Fase 9): quali eventi esistono, come
 * si chiamano in admin, e il contenuto di
 * ogni email. Modulo puro (nessun accesso a database o rete): è testato in
 * `eventi.test.ts` e usato da invio, email e pagina /admin/notifiche.
 */
import { formattaPrezzo, prodotti, type CodiceProdotto } from "@/lib/prodotti";

export const codiciEvento = [
  "nuovo_account",
  "primo_accesso",
  "acquisto",
  "pagamento_in_attesa",
  "rimborso",
  "contestazione_aperta",
  "contestazione_chiusa",
  "profilo_aggiornato",
  "richiesta_ricontatto",
  "richiesta_gdpr",
  "problema_tecnico",
] as const;

export type CodiceEvento = (typeof codiciEvento)[number];

export const isCodiceEvento = (valore: unknown): valore is CodiceEvento =>
  typeof valore === "string" && (codiciEvento as readonly string[]).includes(valore);

type SchedaEvento = {
  etichetta: string;
  descrizione: string;
  gruppo: "Account" | "Pagamenti" | "Profilo e richieste" | "Sistema";
  /** Notifica da gestire subito: evidenziata nell'email e nell'oggetto. */
  urgente?: boolean;
};

export const eventi: Record<CodiceEvento, SchedaEvento> = {
  nuovo_account: {
    etichetta: "Nuovo account",
    descrizione: "Registrazione autonoma, account creato da un acquisto o da un admin.",
    gruppo: "Account",
  },
  primo_accesso: {
    etichetta: "Primo accesso completato",
    descrizione: "Il cliente ha inserito i dati base e accettato la privacy.",
    gruppo: "Account",
  },
  acquisto: {
    etichetta: "Acquisto completato",
    descrizione: "Prodotto, importo, cliente e landing di provenienza.",
    gruppo: "Pagamenti",
  },
  pagamento_in_attesa: {
    etichetta: "Pagamento in elaborazione o non riuscito",
    descrizione: "Metodi di pagamento differiti (es. bonifico).",
    gruppo: "Pagamenti",
  },
  rimborso: {
    etichetta: "Rimborso emesso",
    descrizione: "Rimborso totale: l'accesso al prodotto è stato revocato.",
    gruppo: "Pagamenti",
  },
  contestazione_aperta: {
    etichetta: "Contestazione aperta",
    descrizione: "Urgente: va gestita su Stripe entro la scadenza indicata.",
    gruppo: "Pagamenti",
    urgente: true,
  },
  contestazione_chiusa: {
    etichetta: "Contestazione chiusa",
    descrizione: "Vinta (accesso ripristinato) o persa.",
    gruppo: "Pagamenti",
  },
  profilo_aggiornato: {
    etichetta: "Profilo o immobile aggiornato",
    descrizione: "Al massimo una notifica al giorno per cliente.",
    gruppo: "Profilo e richieste",
  },
  richiesta_ricontatto: {
    etichetta: "Richiesta di ricontatto",
    descrizione: "Il cliente vuole essere ricontattato da Guido per una consulenza.",
    gruppo: "Profilo e richieste",
    urgente: true,
  },
  richiesta_gdpr: {
    etichetta: "Richiesta sui dati personali",
    descrizione: "Scaricamento dei dati o eliminazione dell'account (GDPR).",
    gruppo: "Profilo e richieste",
  },
  problema_tecnico: {
    etichetta: "Problema tecnico",
    descrizione: "Email al cliente non partita, errore del webhook Stripe.",
    gruppo: "Sistema",
  },
};

export const gruppiEvento = ["Account", "Pagamenti", "Profilo e richieste", "Sistema"] as const;

/** Tiene solo codici di evento validi, senza doppioni, nell'ordine del catalogo. */
export function normalizzaEventi(valore: unknown): CodiceEvento[] {
  if (!Array.isArray(valore)) return [];
  return codiciEvento.filter((codice) => valore.includes(codice));
}

// -------------------------------------------------------------
// Dati di ogni evento
// -------------------------------------------------------------

/** Il cliente a cui si riferisce l'evento (diventa il "Rispondi a"). */
export type ClienteNotifica = {
  id?: string | null;
  email: string;
  nome?: string | null;
};

type OrigineAccount = "registrazione" | "acquisto" | "admin";

export type DatiEvento =
  | { evento: "nuovo_account"; cliente: ClienteNotifica; origine: OrigineAccount; guidaAttiva?: boolean }
  | { evento: "primo_accesso"; cliente: ClienteNotifica; telefono?: string | null; marketing: boolean }
  | {
      evento: "acquisto";
      cliente: ClienteNotifica;
      prodotto: CodiceProdotto;
      importoCentesimi: number;
      sessione: string;
      landing?: string | null;
      senzaAccount: boolean;
    }
  | {
      evento: "pagamento_in_attesa";
      cliente: ClienteNotifica;
      prodotto: CodiceProdotto;
      importoCentesimi: number;
      sessione: string;
      esito: "in_elaborazione" | "non_riuscito";
    }
  | { evento: "rimborso"; cliente: ClienteNotifica; prodotto: string; importoCentesimi: number | null; pagamento: string }
  | {
      evento: "contestazione_aperta";
      cliente: ClienteNotifica;
      prodotto: string;
      importoCentesimi: number | null;
      contestazione: string;
      motivo: string;
      /** Scadenza per inviare le prove su Stripe (ISO), se nota. */
      scadenza: string | null;
    }
  | {
      evento: "contestazione_chiusa";
      cliente: ClienteNotifica;
      prodotto: string;
      contestazione: string;
      vinta: boolean;
    }
  | {
      evento: "profilo_aggiornato";
      cliente: ClienteNotifica;
      sezione: string;
      percentuale: number;
      /** Giorno (AAAA-MM-GG, ora italiana): limita a una notifica al giorno. */
      giorno: string;
    }
  | {
      evento: "richiesta_ricontatto";
      cliente: ClienteNotifica;
      telefono?: string | null;
      contatto?: string | null;
      orario?: string | null;
      note?: string | null;
      inviataIl: string;
    }
  | {
      evento: "richiesta_gdpr";
      cliente: ClienteNotifica;
      tipo: "scaricamento" | "eliminazione";
      /** Istante della richiesta (ISO). */
      il: string;
    }
  | {
      evento: "problema_tecnico";
      cliente?: ClienteNotifica | null;
      problema: string;
      dettaglio: string;
      /** Identifica il problema: lo stesso non si notifica due volte. */
      chiave: string;
    };

export type RigaNotifica = { etichetta: string; valore: string };

export type ContenutoNotifica = {
  oggetto: string;
  titolo: string;
  /** Frase introduttiva. */
  testo: string;
  righe: RigaNotifica[];
  urgente: boolean;
  /** Avviso evidenziato (es. scadenza di una contestazione). */
  avviso?: string;
  /** Pulsante principale, se diverso dalla scheda del cliente. */
  pulsante?: { etichetta: string; href: string };
};

const formatoDataOra = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Rome",
});
export const formattaDataOra = (iso: string) => formatoDataOra.format(new Date(iso));

const nomeProdotto = (codice: string) =>
  codice in prodotti ? prodotti[codice as CodiceProdotto].nome.replace(/^(La|Il) /, "") : codice;

const importo = (centesimi: number | null | undefined) =>
  centesimi === null || centesimi === undefined ? "—" : formattaPrezzo(centesimi / 100);

/** "Mario Rossi (mario@…)" oppure solo l'email. */
export const descriviCliente = (cliente: ClienteNotifica) =>
  cliente.nome ? `${cliente.nome} (${cliente.email})` : cliente.email;

const chi = (cliente: ClienteNotifica) => cliente.nome || cliente.email;

const etichetteOrigine: Record<OrigineAccount, string> = {
  registrazione: "Registrazione autonoma",
  acquisto: "Acquisto senza account",
  admin: "Creato da un admin",
};

const etichetteContatto: Record<string, string> = {
  telefono: "Telefono",
  whatsapp: "WhatsApp",
  email: "Email",
  mattina: "Mattina",
  pomeriggio: "Pomeriggio",
  sera: "Sera",
  indifferente: "Indifferente",
};

/** Chiave unica dell'evento nello storico: evita doppie notifiche. */
export function chiaveDeduplica(dati: DatiEvento): string {
  const id = dati.cliente?.id ?? dati.cliente?.email ?? "";
  switch (dati.evento) {
    case "nuovo_account":
    case "primo_accesso":
      return `${dati.evento}:${id}`;
    case "acquisto":
      return `acquisto:${dati.sessione}`;
    case "pagamento_in_attesa":
      return `pagamento_in_attesa:${dati.sessione}:${dati.esito}`;
    case "rimborso":
      return `rimborso:${dati.pagamento}`;
    case "contestazione_aperta":
    case "contestazione_chiusa":
      return `${dati.evento}:${dati.contestazione}`;
    case "profilo_aggiornato":
      return `profilo_aggiornato:${id}:${dati.giorno}`;
    case "richiesta_ricontatto":
      return `richiesta_ricontatto:${id}:${dati.inviataIl}`;
    case "richiesta_gdpr":
      // Al minuto: un doppio clic non manda due email.
      return `richiesta_gdpr:${dati.tipo}:${id}:${dati.il.slice(0, 16)}`;
    case "problema_tecnico":
      return `problema_tecnico:${dati.chiave}`.slice(0, 200);
  }
}

/** Oggetto, testo e righe dell'email di notifica. */
export function contenutoNotifica(dati: DatiEvento): ContenutoNotifica {
  const urgente = eventi[dati.evento].urgente ?? false;
  const prefisso = urgente ? "[Urgente] " : "";
  const riga = (etichetta: string, valore: string | null | undefined): RigaNotifica[] =>
    valore ? [{ etichetta, valore }] : [];
  const cliente = dati.cliente ? riga("Cliente", descriviCliente(dati.cliente)) : [];

  switch (dati.evento) {
    case "nuovo_account":
      return {
        oggetto: `Nuovo account: ${chi(dati.cliente)}`,
        titolo: "Nuovo account",
        testo: "Un nuovo account è stato creato nell'app.",
        righe: [
          ...cliente,
          { etichetta: "Origine", valore: etichetteOrigine[dati.origine] },
          ...(dati.guidaAttiva !== undefined
            ? riga("Guida", dati.guidaAttiva ? "Attiva" : "Non attiva")
            : []),
        ],
        urgente,
      };
    case "primo_accesso":
      return {
        oggetto: `Primo accesso completato: ${chi(dati.cliente)}`,
        titolo: "Primo accesso completato",
        testo: "Il cliente ha inserito i dati base e accettato l'informativa privacy.",
        righe: [
          ...cliente,
          ...riga("Telefono", dati.telefono),
          { etichetta: "Comunicazioni promozionali", valore: dati.marketing ? "Sì" : "No" },
        ],
        urgente,
      };
    case "acquisto":
      return {
        oggetto: `Nuovo acquisto: ${nomeProdotto(dati.prodotto)} (${importo(dati.importoCentesimi)})`,
        titolo: "Acquisto completato",
        testo: "Un pagamento è andato a buon fine e il prodotto è stato sbloccato.",
        righe: [
          ...cliente,
          { etichetta: "Prodotto", valore: `${prodotti[dati.prodotto].nome} — ${prodotti[dati.prodotto].titoloCompleto}` },
          { etichetta: "Importo", valore: importo(dati.importoCentesimi) },
          { etichetta: "Provenienza", valore: dati.landing ? `Landing «${dati.landing}»` : "Area riservata o link diretto" },
          ...(dati.senzaAccount ? riga("Modalità", "Acquisto senza account") : []),
        ],
        urgente,
      };
    case "pagamento_in_attesa": {
      const riuscito = dati.esito === "in_elaborazione";
      return {
        oggetto: riuscito
          ? `Pagamento in elaborazione: ${chi(dati.cliente)}`
          : `Pagamento non riuscito: ${chi(dati.cliente)}`,
        titolo: riuscito ? "Pagamento in elaborazione" : "Pagamento non riuscito",
        testo: riuscito
          ? "Il cliente ha completato il checkout con un metodo differito: il prodotto si sblocca quando arriva l'incasso."
          : "Il pagamento con metodo differito non è andato a buon fine: il prodotto non è stato sbloccato.",
        righe: [
          ...cliente,
          { etichetta: "Prodotto", valore: prodotti[dati.prodotto].nome },
          { etichetta: "Importo", valore: importo(dati.importoCentesimi) },
        ],
        urgente,
      };
    }
    case "rimborso":
      return {
        oggetto: `Rimborso emesso: ${chi(dati.cliente)}`,
        titolo: "Rimborso emesso",
        testo: "Il pagamento è stato rimborsato per intero e l'accesso al prodotto è stato revocato.",
        righe: [
          ...cliente,
          { etichetta: "Prodotto", valore: nomeProdotto(dati.prodotto) },
          { etichetta: "Importo", valore: importo(dati.importoCentesimi) },
        ],
        urgente,
      };
    case "contestazione_aperta":
      return {
        oggetto: `${prefisso}Contestazione aperta: ${chi(dati.cliente)}`,
        titolo: "Contestazione aperta",
        testo:
          "Il cliente ha contestato il pagamento con la sua banca: l'accesso al prodotto è stato revocato. Per difendere il pagamento bisogna inviare le prove su Stripe.",
        righe: [
          ...cliente,
          { etichetta: "Prodotto", valore: nomeProdotto(dati.prodotto) },
          { etichetta: "Importo", valore: importo(dati.importoCentesimi) },
          { etichetta: "Motivo indicato", valore: dati.motivo.replaceAll("_", " ") },
        ],
        avviso: dati.scadenza
          ? `Scadenza per rispondere su Stripe: ${formattaDataOra(dati.scadenza)}`
          : "Controlla su Stripe la scadenza per rispondere.",
        pulsante: { etichetta: "Apri la contestazione su Stripe", href: urlContestazione(dati.contestazione) },
        urgente,
      };
    case "contestazione_chiusa":
      return {
        oggetto: `Contestazione ${dati.vinta ? "vinta" : "persa"}: ${chi(dati.cliente)}`,
        titolo: `Contestazione ${dati.vinta ? "vinta" : "persa"}`,
        testo: dati.vinta
          ? "La contestazione si è chiusa a favore: l'acquisto torna valido e l'accesso è stato ripristinato."
          : "La contestazione si è chiusa a favore del cliente: l'importo è stato restituito e l'accesso resta revocato.",
        righe: [...cliente, { etichetta: "Prodotto", valore: nomeProdotto(dati.prodotto) }],
        urgente,
      };
    case "profilo_aggiornato":
      return {
        oggetto: `Profilo aggiornato: ${chi(dati.cliente)}`,
        titolo: "Profilo aggiornato",
        testo: "Il cliente ha aggiornato il suo profilo. Ricevi al massimo una notifica al giorno per cliente.",
        righe: [
          ...cliente,
          { etichetta: "Sezione salvata", valore: dati.sezione },
          { etichetta: "Profilo completo al", valore: `${dati.percentuale}%` },
        ],
        urgente,
      };
    case "richiesta_ricontatto":
      return {
        oggetto: `${prefisso}Richiesta di ricontatto: ${chi(dati.cliente)}`,
        titolo: "Richiesta di ricontatto",
        testo: "Il cliente vorrebbe essere ricontattato da Guido per una consulenza.",
        righe: [
          ...cliente,
          ...riga("Telefono", dati.telefono),
          ...riga("Contatto preferito", dati.contatto ? etichetteContatto[dati.contatto] ?? dati.contatto : null),
          ...riga("Orario preferito", dati.orario ? etichetteContatto[dati.orario] ?? dati.orario : null),
          ...riga("Note", dati.note),
          { etichetta: "Richiesta inviata il", valore: formattaDataOra(dati.inviataIl) },
        ],
        urgente,
      };
    case "richiesta_gdpr":
      return {
        oggetto:
          dati.tipo === "eliminazione"
            ? `Account eliminato dal cliente: ${chi(dati.cliente)}`
            : `Dati personali scaricati: ${chi(dati.cliente)}`,
        titolo: dati.tipo === "eliminazione" ? "Eliminazione dell'account" : "Scaricamento dei dati personali",
        testo:
          dati.tipo === "eliminazione"
            ? "Il cliente ha eliminato il proprio account: profilo e immobile sono stati cancellati, gli acquisti restano senza collegamento all'utente."
            : "Il cliente ha scaricato i propri dati personali (account, immobile e acquisti) dal profilo.",
        righe: [...cliente, { etichetta: "Data", valore: formattaDataOra(dati.il) }],
        urgente,
      };
    case "problema_tecnico":
      return {
        oggetto: `Problema tecnico: ${dati.problema}`,
        titolo: "Problema tecnico",
        testo: dati.problema,
        righe: [...cliente, { etichetta: "Dettaglio", valore: dati.dettaglio.slice(0, 1000) }],
        urgente,
      };
  }
}

/** Contestazione nel pannello Stripe (modalità test o live a seconda della chiave). */
function urlContestazione(id: string) {
  const live = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");
  return `https://dashboard.stripe.com/${live ? "" : "test/"}disputes/${id}`;
}
