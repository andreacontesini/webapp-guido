/**
 * Campi del profilo del cliente: unica definizione usata da moduli,
 * validazione, completamento, popup admin e PDF. I `nome` coincidono con le
 * colonne del database (`profiles` o `properties`).
 */
import type { CodiceDocumento, RispostaDocumento } from "@/lib/supabase/tipi";

export type Opzione = { valore: string; etichetta: string };
export type Condizione = { campo: string; valori: string[] };

type Base = {
  nome: string;
  etichetta: string;
  aiuto?: string;
  obbligatorio?: boolean;
  /** Il campo vale solo se un altro campo della sezione ha uno di questi valori. */
  quando?: Condizione;
};

export type Campo =
  | (Base & { tipo: "testo"; max: number; multilinea?: boolean; autocomplete?: string })
  | (Base & {
      tipo: "intero";
      min: number;
      max: number;
      unita?: string;
      /** Parole accettate al posto del numero (minuscole), es. "terra" → 0. */
      parole?: Record<string, number>;
    })
  | (Base & { tipo: "scelta"; opzioni: readonly Opzione[] })
  | (Base & { tipo: "sino" })
  | (Base & { tipo: "data" })
  | (Base & { tipo: "documenti" });

export type IdSezione = "personali" | "casa" | "situazione" | "obiettivi" | "note";

export type Sezione = {
  id: IdSezione;
  titolo: string;
  descrizione: string;
  tabella: "profiles" | "properties";
  campi: Campo[];
  /** Le note sono facoltative per natura: non contano nella percentuale. */
  contaNelCompletamento: boolean;
};

const op = (...coppie: [string, string][]): Opzione[] =>
  coppie.map(([valore, etichetta]) => ({ valore, etichetta }));

const siNoNonSo = op(["si", "Sì"], ["no", "No"], ["non_so", "Non so"]);

export const documenti: { codice: CodiceDocumento; etichetta: string }[] = [
  { codice: "atto_provenienza", etichetta: "Atto di provenienza (rogito o successione)" },
  { codice: "planimetria", etichetta: "Planimetria catastale" },
  { codice: "visura", etichetta: "Visura catastale" },
  { codice: "ape", etichetta: "Attestato di prestazione energetica (APE)" },
  { codice: "agibilita", etichetta: "Certificato di agibilità" },
  { codice: "spese_condominiali", etichetta: "Ultime spese e regolamento condominiale" },
];

export const risposteDocumento: { valore: RispostaDocumento; etichetta: string }[] = [
  { valore: "si", etichetta: "Ce l'ho" },
  { valore: "no", etichetta: "Non ce l'ho" },
  { valore: "non_so", etichetta: "Non so" },
];

export const sezioni: Sezione[] = [
  {
    id: "personali",
    titolo: "Dati personali",
    descrizione: "Come ti chiami e come preferisci essere contattato.",
    tabella: "profiles",
    contaNelCompletamento: true,
    campi: [
      { nome: "first_name", etichetta: "Nome", tipo: "testo", max: 80, obbligatorio: true, autocomplete: "given-name" },
      { nome: "last_name", etichetta: "Cognome", tipo: "testo", max: 80, obbligatorio: true, autocomplete: "family-name" },
      { nome: "phone", etichetta: "Telefono", tipo: "testo", max: 20, autocomplete: "tel" },
      { nome: "residence_city", etichetta: "Comune di residenza", tipo: "testo", max: 80, autocomplete: "address-level2" },
      { nome: "residence_province", etichetta: "Provincia", tipo: "testo", max: 40, autocomplete: "address-level1" },
      { nome: "contact_preference", etichetta: "Come preferisci essere contattato?", tipo: "scelta", opzioni: op(["telefono", "Telefono"], ["whatsapp", "WhatsApp"], ["email", "Email"]) },
      { nome: "contact_time", etichetta: "Quando preferisci essere contattato?", tipo: "scelta", opzioni: op(["mattina", "Mattina"], ["pomeriggio", "Pomeriggio"], ["sera", "Sera"], ["indifferente", "Indifferente"]) },
    ],
  },
  {
    id: "casa",
    titolo: "La tua casa",
    descrizione: "Dove si trova e com'è la casa che vuoi vendere.",
    tabella: "properties",
    contaNelCompletamento: true,
    campi: [
      { nome: "city", etichetta: "Comune", tipo: "testo", max: 80 },
      { nome: "province", etichetta: "Provincia", tipo: "testo", max: 40 },
      { nome: "area", etichetta: "Zona o quartiere", tipo: "testo", max: 80 },
      { nome: "street", etichetta: "Via e numero civico", tipo: "testo", max: 120, aiuto: "Facoltativa: serve solo a Guido per una valutazione più precisa, non viene mostrata a nessun altro." },
      { nome: "property_type", etichetta: "Tipologia", tipo: "scelta", opzioni: op(["appartamento", "Appartamento"], ["villa", "Villa o villetta"], ["casa_indipendente", "Casa indipendente"], ["rustico", "Rustico o casale"], ["attico", "Attico"], ["altro", "Altro"]) },
      { nome: "usage", etichetta: "Uso attuale", tipo: "scelta", opzioni: op(["abitazione_principale", "Abitazione principale"], ["seconda_casa", "Seconda casa"], ["investimento", "Investimento"], ["altro", "Altro"]) },
      { nome: "surface_sqm", etichetta: "Superficie commerciale", tipo: "intero", min: 10, max: 2000, unita: "m²" },
      { nome: "rooms", etichetta: "Locali", tipo: "intero", min: 1, max: 30 },
      { nome: "bedrooms", etichetta: "Camere da letto", tipo: "intero", min: 0, max: 20 },
      { nome: "bathrooms", etichetta: "Bagni", tipo: "intero", min: 0, max: 10 },
      { nome: "floor", etichetta: "Piano", tipo: "intero", min: -2, max: 60, aiuto: "Un numero, oppure \"terra\" o \"seminterrato\".", parole: { terra: 0, "piano terra": 0, t: 0, pt: 0, rialzato: 0, "piano rialzato": 0, seminterrato: -1, interrato: -1 } },
      { nome: "has_elevator", etichetta: "Ascensore", tipo: "sino" },
      { nome: "year_built", etichetta: "Anno di costruzione (anche indicativo)", tipo: "intero", min: 1500, max: new Date().getFullYear() + 3 },
      { nome: "condition", etichetta: "Stato", tipo: "scelta", opzioni: op(["da_ristrutturare", "Da ristrutturare"], ["buono", "Buono"], ["ristrutturato", "Ristrutturato"], ["nuovo", "Nuovo"]) },
      { nome: "energy_class", etichetta: "Classe energetica", tipo: "scelta", opzioni: op(["A4", "A4"], ["A3", "A3"], ["A2", "A2"], ["A1", "A1"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"], ["G", "G"], ["non_so", "Non so"]) },
      { nome: "has_garage", etichetta: "Box o posto auto", tipo: "sino" },
      { nome: "has_cellar", etichetta: "Cantina", tipo: "sino" },
      { nome: "has_garden", etichetta: "Giardino", tipo: "sino" },
      { nome: "has_terrace", etichetta: "Terrazzo o balcone", tipo: "sino" },
      { nome: "heating", etichetta: "Riscaldamento", tipo: "scelta", opzioni: op(["autonomo", "Autonomo"], ["centralizzato", "Centralizzato"], ["assente", "Assente"], ["non_so", "Non so"]) },
      { nome: "condo_fees_monthly", etichetta: "Spese condominiali al mese", tipo: "intero", min: 0, max: 5000, unita: "€" },
    ],
  },
  {
    id: "situazione",
    titolo: "Situazione e documenti",
    descrizione: "Le informazioni che più spesso rallentano o bloccano una vendita.",
    tabella: "properties",
    contaNelCompletamento: true,
    campi: [
      { nome: "ownership", etichetta: "Proprietà", tipo: "scelta", opzioni: op(["unico", "Sono l'unico proprietario"], ["cointestato", "È cointestata"]) },
      { nome: "owners_count", etichetta: "Quanti proprietari?", tipo: "intero", min: 2, max: 20, quando: { campo: "ownership", valori: ["cointestato"] } },
      { nome: "owners_agree", etichetta: "Sono tutti d'accordo a vendere?", tipo: "scelta", opzioni: siNoNonSo, quando: { campo: "ownership", valori: ["cointestato"] } },
      { nome: "inherited", etichetta: "L'hai ricevuta in eredità?", tipo: "sino" },
      { nome: "succession_done", etichetta: "La successione è stata fatta?", tipo: "scelta", opzioni: op(["si", "Sì"], ["no", "No"], ["in_corso", "In corso"], ["non_so", "Non so"]), quando: { campo: "inherited", valori: ["si"] } },
      { nome: "mortgage", etichetta: "Mutuo o ipoteca", tipo: "scelta", opzioni: op(["nessuno", "Nessuno"], ["mutuo_residuo", "Mutuo ancora da estinguere"], ["ipoteca", "Ipoteca"], ["non_so", "Non so"]) },
      { nome: "occupancy", etichetta: "Oggi la casa è", tipo: "scelta", opzioni: op(["libero", "Libera"], ["abitato_proprietario", "Abitata da me o dai proprietari"], ["affittato", "Affittata"]) },
      { nome: "lease_end", etichetta: "Scadenza del contratto d'affitto", tipo: "data", quando: { campo: "occupancy", valori: ["affittato"] } },
      { nome: "compliance_doubts", etichetta: "Hai dubbi sulla conformità urbanistica o catastale?", aiuto: "Per esempio verande, soppalchi o modifiche interne non dichiarate.", tipo: "scelta", opzioni: op(["no", "No"], ["si", "Sì"], ["non_so", "Non so"]) },
      { nome: "compliance_notes", etichetta: "Quali dubbi?", tipo: "testo", max: 1000, multilinea: true, quando: { campo: "compliance_doubts", valori: ["si", "non_so"] } },
      { nome: "building_bonus_works", etichetta: "Ci sono lavori con bonus edilizi (es. Superbonus) in corso o recenti?", tipo: "sino" },
      { nome: "documents", etichetta: "Documenti", tipo: "documenti", aiuto: "Dicci quali documenti hai già: Guido ti aiuterà a recuperare quelli che mancano." },
    ],
  },
  {
    id: "obiettivi",
    titolo: "Obiettivi di vendita",
    descrizione: "Tempi, motivazioni e aspettative.",
    tabella: "properties",
    contaNelCompletamento: true,
    campi: [
      { nome: "sale_timeline", etichetta: "Entro quando vorresti vendere?", tipo: "scelta", opzioni: op(["entro_3_mesi", "Entro 3 mesi"], ["entro_6_mesi", "Entro 6 mesi"], ["entro_12_mesi", "Entro 12 mesi"], ["nessuna_fretta", "Nessuna fretta"]) },
      { nome: "sale_reason", etichetta: "Perché vendi?", tipo: "scelta", opzioni: op(["acquisto_altra_casa", "Compro un'altra casa"], ["trasferimento", "Trasferimento"], ["eredita", "Eredità"], ["liquidita", "Ho bisogno di liquidità"], ["separazione", "Separazione"], ["altro", "Altro"]) },
      { nome: "linked_purchase", etichetta: "La vendita è legata all'acquisto di un'altra casa?", tipo: "scelta", opzioni: siNoNonSo },
      { nome: "expected_price", etichetta: "Prezzo che hai in mente", tipo: "intero", min: 1000, max: 20000000, unita: "€" },
      { nome: "valuation_done", etichetta: "Hai già fatto fare una valutazione?", tipo: "sino" },
      { nome: "valuation_by", etichetta: "Da chi?", tipo: "testo", max: 120, quando: { campo: "valuation_done", valori: ["si"] } },
      { nome: "listed_before", etichetta: "L'hai già messa in vendita?", tipo: "scelta", opzioni: op(["no", "No"], ["portali_privato", "Sì, da privato sui portali"], ["agenzia_conclusa", "Sì, con un'agenzia (incarico concluso)"], ["agenzia_in_corso", "Sì, con un'agenzia (incarico in corso)"]) },
    ],
  },
  {
    id: "note",
    titolo: "Note per Guido",
    descrizione: "Qualsiasi altra cosa che Guido dovrebbe sapere.",
    tabella: "properties",
    contaNelCompletamento: false,
    campi: [{ nome: "notes", etichetta: "Note", tipo: "testo", max: 2000, multilinea: true }],
  },
];

export function sezionePerId(id: string) {
  return sezioni.find((s) => s.id === id);
}

/** Valore del database → valore del modulo (stringa). */
export function inModulo(campo: Campo, valore: unknown): string {
  if (valore === null || valore === undefined) return "";
  if (campo.tipo === "sino") return valore ? "si" : "no";
  return String(valore);
}

/** Il campo è da mostrare/salvare con questi valori del modulo? */
export function isVisibile(campo: Campo, valoriModulo: Record<string, string>) {
  return !campo.quando || campo.quando.valori.includes(valoriModulo[campo.quando.campo] ?? "");
}

const formatoNumero = new Intl.NumberFormat("it-IT");
const formatoData = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" });

/** Valore leggibile per popup admin e PDF; null se non compilato. */
export function etichettaValore(campo: Campo, valore: unknown): string | null {
  if (valore === null || valore === undefined || valore === "") return null;
  switch (campo.tipo) {
    case "sino":
      return valore ? "Sì" : "No";
    case "scelta":
      return campo.opzioni.find((o) => o.valore === valore)?.etichetta ?? String(valore);
    case "intero":
      return campo.unita === "€"
        ? `${formatoNumero.format(Number(valore))} €`
        : `${formatoNumero.format(Number(valore))}${campo.unita ? ` ${campo.unita}` : ""}`;
    case "data":
      return formatoData.format(new Date(`${valore}T12:00:00Z`));
    case "documenti": {
      const risposte = valore as Record<string, string>;
      const righe = documenti
        .filter((d) => risposte[d.codice])
        .map((d) => `${d.etichetta}: ${risposteDocumento.find((r) => r.valore === risposte[d.codice])?.etichetta}`);
      return righe.length ? righe.join("\n") : null;
    }
    default:
      return String(valore);
  }
}
