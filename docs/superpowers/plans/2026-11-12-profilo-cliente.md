# Profilo del cliente — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pagina `/dashboard/profilo` dove il cliente compila dati personali e scheda della casa, con percentuale di completamento; in admin popup di sola lettura e PDF "Scheda cliente".

**Architecture:** una definizione unica dei campi (`src/lib/profilo/campi.ts`) guida moduli, validazione, completamento, popup admin e PDF. I dati stanno in colonne vere: nuove colonne su `profiles`, nuova tabella `properties` (una riga per cliente) con RLS. Ogni sezione si salva con un'unica azione server parametrica.

**Tech Stack:** Next.js 16 App Router (server actions, `useActionState`), Supabase (Postgres + RLS), Tailwind + componenti `src/components/ui`, `@react-pdf/renderer` 4.9.0 per il PDF, test con `node:test` eseguiti da `tsx` (già installato).

**Spec:** `docs/superpowers/specs/2026-11-12-profilo-cliente-design.md`

## Global Constraints

- Interfaccia e codice in italiano (nomi di funzioni, variabili, commenti, testi); colonne del database in inglese come quelle esistenti.
- Tutto facoltativo tranne **nome e cognome** (come in /benvenuto: il telefono lì è facoltativo, resta facoltativo anche qui).
- L'email non è modificabile.
- Via: facoltativa, con la nota "Facoltativa: serve solo a Guido per una valutazione più precisa, non viene mostrata a nessun altro."
- Messaggio di completamento: "Più informazioni ci dai, più Guido può aiutarti in modo concreto: capire il valore della tua casa, i documenti che mancano e i tempi giusti per vendere."
- Nessun caricamento di file; nessuna sezione "A che punto sei"; nessuna richiesta di ricontatto (Fase 9).
- Commit semantici in italiano a ogni task, con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; spunta del `TODO.md` prima del commit.

## Review Focus

1. **Domande condizionali cambiate dopo il salvataggio** (es. "cointestata" → "unico"): il valore dipendente (`owners_count`) deve tornare `null`, non restare salvato. Test in Task 2.
2. **Numeri scritti all'italiana** ("250.000", "1 200", "85 m²"): vanno accettati, non segnalati come errore. Test in Task 2.
3. **Errore di validazione in una sezione**: il modulo non deve perdere quanto scritto. Gestito in Task 5 con i valori inviati restituiti dall'azione.
4. **Cliente che prova a scrivere campi riservati** (`role`, `guide_access`) o la riga di un altro: bloccato dal database. Verifica in Task 1.
5. **Profilo senza riga `properties`** (cliente che non ha mai salvato la casa): pagina, completamento, popup e PDF funzionano con immobile `null`. Test in Task 3, controllo in Task 6-7.

---

## File

| File | Responsabilità |
|---|---|
| `supabase/migrations/20261118090000_profilo_cliente.sql` | colonne `profiles`, tabella `properties`, grant e RLS |
| `src/lib/supabase/tipi.ts` | tipi `Profilo` estesi, `Immobile`, tabella `properties` |
| `src/lib/profilo/campi.ts` | sezioni, campi, opzioni, etichette, condizioni, conversioni valore ↔ modulo |
| `src/lib/profilo/validazione.ts` | `validaSezione(sezione, formData)` |
| `src/lib/profilo/completamento.ts` | `calcolaCompletamento(profilo, immobile)` |
| `src/lib/profilo/dati.ts` | lettura profilo + immobile dell'utente corrente / di un utente (admin) |
| `src/lib/profilo/*.test.ts` | test |
| `src/app/dashboard/profilo/azioni.ts` | `salvaSezione` |
| `src/app/dashboard/profilo/page.tsx`, `sezione-profilo.tsx`, `campo-profilo.tsx`, `riepilogo-completamento.tsx` | pagina cliente |
| `src/components/layout/nav-items.ts` | voce Profilo attiva |
| `src/app/dashboard/page.tsx` | riquadro "Completa il tuo profilo" |
| `src/app/admin/utenti/profilo-utente.tsx`, `page.tsx` | colonna e popup admin |
| `src/app/admin/utenti/[id]/scheda.pdf/route.ts`, `src/lib/profilo/scheda-pdf.tsx` | PDF |
| `package.json` | script `test`, dipendenza `@react-pdf/renderer` |

---

### Task 1: Migrazione, tipi e verifica dei permessi

**Files:**
- Create: `supabase/migrations/20261118090000_profilo_cliente.sql`
- Modify: `src/lib/supabase/tipi.ts`

**Interfaces:**
- Produces: tipi `Profilo` (con `residence_city`, `residence_province`, `contact_preference`, `contact_time`), `Immobile` (riga `properties`), `Documenti = Partial<Record<CodiceDocumento, "si" | "no" | "non_so">>`, tabella `properties` in `Database`.

- [ ] **Step 1: Scrivere la migrazione**

```sql
-- =============================================================
-- Fase 8 — Profilo del cliente
-- Nuovi dati personali su profiles e scheda dell'immobile da vendere
-- (una riga per cliente). Tutto facoltativo. Il cliente legge e
-- modifica solo i propri dati, l'admin legge tutto.
-- =============================================================

alter table public.profiles
  add column residence_city     text check (char_length(residence_city) <= 80),
  add column residence_province text check (char_length(residence_province) <= 40),
  add column contact_preference text check (contact_preference in ('telefono', 'whatsapp', 'email')),
  add column contact_time       text check (contact_time in ('mattina', 'pomeriggio', 'sera', 'indifferente'));

-- Il cliente può modificare anche i nuovi campi (grant per colonna, come gli altri).
grant update (residence_city, residence_province, contact_preference, contact_time)
  on public.profiles to authenticated;

create table public.properties (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references public.profiles (id) on delete cascade,
  -- La casa
  street               text check (char_length(street) <= 120),
  city                 text check (char_length(city) <= 80),
  province             text check (char_length(province) <= 40),
  area                 text check (char_length(area) <= 80),
  property_type        text check (property_type in ('appartamento', 'villa', 'casa_indipendente', 'rustico', 'attico', 'altro')),
  usage                text check (usage in ('abitazione_principale', 'seconda_casa', 'investimento', 'altro')),
  surface_sqm          integer check (surface_sqm between 10 and 2000),
  rooms                integer check (rooms between 1 and 30),
  bedrooms             integer check (bedrooms between 0 and 20),
  bathrooms            integer check (bathrooms between 0 and 10),
  floor                integer check (floor between -2 and 60),
  has_elevator         boolean,
  year_built           integer check (year_built between 1500 and 2100),
  condition            text check (condition in ('da_ristrutturare', 'buono', 'ristrutturato', 'nuovo')),
  energy_class         text check (energy_class in ('A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G', 'non_so')),
  has_garage           boolean,
  has_cellar           boolean,
  has_garden           boolean,
  has_terrace          boolean,
  heating              text check (heating in ('autonomo', 'centralizzato', 'assente', 'non_so')),
  condo_fees_monthly   integer check (condo_fees_monthly between 0 and 5000),
  -- Situazione
  ownership            text check (ownership in ('unico', 'cointestato')),
  owners_count         integer check (owners_count between 2 and 20),
  owners_agree         text check (owners_agree in ('si', 'no', 'non_so')),
  inherited            boolean,
  succession_done      text check (succession_done in ('si', 'no', 'in_corso', 'non_so')),
  mortgage             text check (mortgage in ('nessuno', 'mutuo_residuo', 'ipoteca', 'non_so')),
  occupancy            text check (occupancy in ('libero', 'abitato_proprietario', 'affittato')),
  lease_end            date,
  compliance_doubts    text check (compliance_doubts in ('no', 'si', 'non_so')),
  compliance_notes     text check (char_length(compliance_notes) <= 1000),
  building_bonus_works boolean,
  documents            jsonb not null default '{}'::jsonb check (
    jsonb_typeof(documents) = 'object'
    and documents - array['atto_provenienza', 'planimetria', 'visura', 'ape', 'agibilita', 'spese_condominiali'] = '{}'::jsonb
    and not exists (
      select 1 from jsonb_each_text(documents) d where d.value not in ('si', 'no', 'non_so')
    )
  ),
  -- Obiettivi
  sale_timeline        text check (sale_timeline in ('entro_3_mesi', 'entro_6_mesi', 'entro_12_mesi', 'nessuna_fretta')),
  sale_reason          text check (sale_reason in ('acquisto_altra_casa', 'trasferimento', 'eredita', 'liquidita', 'separazione', 'altro')),
  linked_purchase      text check (linked_purchase in ('si', 'no', 'non_so')),
  expected_price       integer check (expected_price between 1000 and 20000000),
  valuation_done       boolean,
  valuation_by         text check (char_length(valuation_by) <= 120),
  listed_before        text check (listed_before in ('no', 'portali_privato', 'agenzia_conclusa', 'agenzia_in_corso')),
  -- Note
  notes                text check (char_length(notes) <= 2000),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.properties is 'Immobile da vendere del cliente (uno per cliente), compilato dal profilo.';
comment on column public.properties.street is 'Facoltativa: visibile solo al cliente e agli admin.';

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.imposta_updated_at();

alter table public.properties enable row level security;

revoke all on public.properties from anon, authenticated;
grant select, insert, update on public.properties to authenticated;

create policy "Lettura del proprio immobile o admin"
  on public.properties for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Inserimento del proprio immobile"
  on public.properties for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Modifica del proprio immobile"
  on public.properties for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
-- Nessuna policy di delete: l'eliminazione arriverà con la parte GDPR (cascade dal profilo).
```

Nota: i `check` con sottoquery non sono ammessi in Postgres. Se l'applicazione fallisce su `documents`, sostituire il terzo controllo con una funzione `immutable` `public.documenti_validi(jsonb) returns boolean` (corpo SQL con `not exists (select 1 from jsonb_each_text($1) …)`) e usare `check (public.documenti_validi(documents))`.

- [ ] **Step 2: Applicare la migrazione**

Installare il driver in una cartella temporanea (non nel progetto) ed eseguire il file:

```bash
S=/private/tmp/claude-501/-Users-andreacontesini-Progetti-webapp-guido/1dda7c58-d025-4c63-b0ef-a4bc47d121be/scratchpad/pg
mkdir -p $S && npm i --prefix $S pg@8.16.3 --silent
cat > $S/applica.mjs <<'EOF'
import fs from "node:fs";
import pg from "pg";
const env = Object.fromEntries(fs.readFileSync(process.argv[2], "utf8").split("\n").map(l => l.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].trim()]));
const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
try { await client.query("begin"); await client.query(fs.readFileSync(process.argv[3], "utf8")); await client.query("commit"); console.log("OK"); }
catch (e) { await client.query("rollback"); console.error("ERRORE:", e.message); process.exitCode = 1; }
finally { await client.end(); }
EOF
node $S/applica.mjs .env.local supabase/migrations/20261118090000_profilo_cliente.sql
```

Expected: `OK`.

- [ ] **Step 3: Verificare permessi con utenti veri**

Script in scratchpad che crea due utenti di prova (`delivered+a@resend.dev`, `delivered+b@resend.dev`) con l'admin client, ottiene per ciascuno una sessione (`generateLink` magiclink → `verifyOtp` con client anonimo), poi controlla:
- A inserisce e legge la propria riga `properties`: OK;
- B non vede la riga di A (select vuota) e non può modificarla (0 righe aggiornate) né inserirne una con `user_id` di A (errore RLS);
- A non può aggiornare `role` o `guide_access` sul proprio profilo (errore di permesso), può aggiornare `residence_city`;
- insert con `documents = {"ape":"forse"}` fallisce, con `{"ape":"si"}` riesce;
- l'admin (`web@andreacontesini.com` non è admin: usare l'admin client per la lettura generale e verificare la policy `is_admin` leggendo con una sessione di un account admin esistente se disponibile, altrimenti promuovere temporaneamente l'utente B ad admin con il service role e rimetterlo cliente).
- pulizia: eliminare i due utenti (cascade su `properties`).

Expected: ogni controllo stampa `✓`.

- [ ] **Step 4: Aggiornare i tipi** in `src/lib/supabase/tipi.ts`

```ts
// in Profilo, dopo marketing_consent:
  residence_city: string | null;
  residence_province: string | null;
  contact_preference: "telefono" | "whatsapp" | "email" | null;
  contact_time: "mattina" | "pomeriggio" | "sera" | "indifferente" | null;

export type CodiceDocumento =
  | "atto_provenienza" | "planimetria" | "visura" | "ape" | "agibilita" | "spese_condominiali";
export type RispostaDocumento = "si" | "no" | "non_so";
export type Documenti = Partial<Record<CodiceDocumento, RispostaDocumento>>;

/** Immobile da vendere del cliente (tabella `properties`). Valori testuali validati da `campi.ts` e dal database. */
export type Immobile = {
  id: string;
  user_id: string;
  street: string | null; city: string | null; province: string | null; area: string | null;
  property_type: string | null; usage: string | null;
  surface_sqm: number | null; rooms: number | null; bedrooms: number | null; bathrooms: number | null;
  floor: number | null; has_elevator: boolean | null; year_built: number | null;
  condition: string | null; energy_class: string | null;
  has_garage: boolean | null; has_cellar: boolean | null; has_garden: boolean | null; has_terrace: boolean | null;
  heating: string | null; condo_fees_monthly: number | null;
  ownership: string | null; owners_count: number | null; owners_agree: string | null;
  inherited: boolean | null; succession_done: string | null; mortgage: string | null;
  occupancy: string | null; lease_end: string | null;
  compliance_doubts: string | null; compliance_notes: string | null; building_bonus_works: boolean | null;
  documents: Documenti;
  sale_timeline: string | null; sale_reason: string | null; linked_purchase: string | null;
  expected_price: number | null; valuation_done: boolean | null; valuation_by: string | null;
  listed_before: string | null;
  notes: string | null;
  created_at: string; updated_at: string;
};

// in Database.public.Tables:
      properties: {
        Row: Immobile;
        Insert: Partial<Omit<Immobile, "id" | "created_at" | "updated_at">> & { user_id: string };
        Update: Partial<Omit<Immobile, "id" | "user_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
```

Run: `npx tsc --noEmit` → nessun errore.

- [ ] **Step 5: Commit** — `feat(db): profilo del cliente, colonne di contatto su profiles e tabella properties con RLS`

---

### Task 2: Definizione dei campi e validazione

**Files:**
- Create: `src/lib/profilo/campi.ts`, `src/lib/profilo/validazione.ts`, `src/lib/profilo/validazione.test.ts`
- Modify: `package.json` (script `"test": "tsx --test src/**/*.test.ts"`)

**Interfaces:**
- Produces:
  - `type IdSezione = "personali" | "casa" | "situazione" | "obiettivi" | "note"`
  - `type Campo` (unione discriminata da `tipo`: `"testo" | "intero" | "scelta" | "sino" | "data" | "documenti"`, con `nome`, `etichetta`, `aiuto?`, `obbligatorio?`, `quando?: { campo: string; valori: string[] }`, e per tipo `max`, `min/max/unita`, `opzioni`, `multilinea`)
  - `sezioni: Sezione[]` con `{ id, titolo, descrizione, tabella: "profiles" | "properties", campi, contaNelCompletamento }`
  - `sezionePerId(id: string): Sezione | undefined`
  - `documenti: { codice: CodiceDocumento; etichetta: string }[]`, `risposteDocumento`
  - `inModulo(campo, valore: unknown): string` (valore del database → stringa del modulo: `true`→`"si"`, `false`→`"no"`, numero→cifre, `null`→`""`)
  - `etichettaValore(campo, valore: unknown): string | null` (per popup e PDF: `"Appartamento"`, `"Sì"`, `"85 m²"`, data italiana; `null` se vuoto)
  - `isVisibile(campo, valoriModulo: Record<string, string>): boolean`
  - `validaSezione(sezione, formData): { valori: Record<string, unknown>; errori: Record<string, string>; inviati: Record<string, string> }`

- [ ] **Step 1: Scrivere i test** (`validazione.test.ts`)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { sezionePerId } from "./campi";
import { validaSezione } from "./validazione";

const modulo = (dati: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(dati)) fd.set(k, v);
  return fd;
};
const sezione = (id: string) => sezionePerId(id)!;

test("dati personali: nome e cognome obbligatori", () => {
  const { errori } = validaSezione(sezione("personali"), modulo({ first_name: "", last_name: "R" }));
  assert.ok(errori.first_name);
  assert.ok(errori.last_name);
});

test("dati personali validi, campi vuoti diventano null", () => {
  const { valori, errori } = validaSezione(
    sezione("personali"),
    modulo({ first_name: " Mario ", last_name: "Rossi", phone: "", contact_preference: "whatsapp", contact_time: "" }),
  );
  assert.deepEqual(errori, {});
  assert.equal(valori.first_name, "Mario");
  assert.equal(valori.phone, null);
  assert.equal(valori.contact_preference, "whatsapp");
  assert.equal(valori.contact_time, null);
});

test("scelta fuori elenco è un errore", () => {
  const { errori } = validaSezione(sezione("casa"), modulo({ property_type: "castello" }));
  assert.ok(errori.property_type);
});

test("numeri all'italiana accettati", () => {
  const { valori, errori } = validaSezione(
    sezione("obiettivi"),
    modulo({ expected_price: "250.000", sale_timeline: "entro_6_mesi" }),
  );
  assert.deepEqual(errori, {});
  assert.equal(valori.expected_price, 250000);
  const casa = validaSezione(sezione("casa"), modulo({ surface_sqm: "1 200", condo_fees_monthly: "85 €" }));
  assert.equal(casa.valori.surface_sqm, 1200);
  assert.equal(casa.valori.condo_fees_monthly, 85);
});

test("numeri fuori intervallo o non interi sono errori", () => {
  const { errori } = validaSezione(sezione("casa"), modulo({ surface_sqm: "5", rooms: "2,5" }));
  assert.ok(errori.surface_sqm);
  assert.ok(errori.rooms);
});

test("sì/no: si, no e vuoto", () => {
  const { valori } = validaSezione(sezione("casa"), modulo({ has_elevator: "si", has_garage: "no", has_cellar: "" }));
  assert.equal(valori.has_elevator, true);
  assert.equal(valori.has_garage, false);
  assert.equal(valori.has_cellar, null);
});

test("domande condizionali azzerate se la condizione non vale", () => {
  const { valori } = validaSezione(
    sezione("situazione"),
    modulo({ ownership: "unico", owners_count: "3", owners_agree: "si", inherited: "no", succession_done: "si", occupancy: "libero", lease_end: "2027-01-31" }),
  );
  assert.equal(valori.owners_count, null);
  assert.equal(valori.owners_agree, null);
  assert.equal(valori.succession_done, null);
  assert.equal(valori.lease_end, null);
});

test("domande condizionali salvate se la condizione vale", () => {
  const { valori, errori } = validaSezione(
    sezione("situazione"),
    modulo({ ownership: "cointestato", owners_count: "3", occupancy: "affittato", lease_end: "2027-01-31" }),
  );
  assert.deepEqual(errori, {});
  assert.equal(valori.owners_count, 3);
  assert.equal(valori.lease_end, "2027-01-31");
});

test("data non valida è un errore", () => {
  const { errori } = validaSezione(sezione("situazione"), modulo({ occupancy: "affittato", lease_end: "2027-02-31" }));
  assert.ok(errori.lease_end);
});

test("documenti: solo risposte valide, le vuote non salvate", () => {
  const { valori, errori } = validaSezione(
    sezione("situazione"),
    modulo({ "documents.ape": "si", "documents.visura": "non_so", "documents.planimetria": "" }),
  );
  assert.deepEqual(errori, {});
  assert.deepEqual(valori.documents, { ape: "si", visura: "non_so" });
  assert.ok(validaSezione(sezione("situazione"), modulo({ "documents.ape": "forse" })).errori.documents);
});

test("testo oltre il limite è un errore, a capo conservati nelle note", () => {
  assert.ok(validaSezione(sezione("note"), modulo({ notes: "x".repeat(2001) })).errori.notes);
  assert.equal(validaSezione(sezione("note"), modulo({ notes: "riga 1\nriga 2" })).valori.notes, "riga 1\nriga 2");
});

test("i valori inviati tornano indietro per ricompilare il modulo", () => {
  const { inviati } = validaSezione(sezione("casa"), modulo({ surface_sqm: "abc", city: "Brescia" }));
  assert.equal(inviati.surface_sqm, "abc");
  assert.equal(inviati.city, "Brescia");
});
```

- [ ] **Step 2: Eseguire i test** — Run: `npm test` · Expected: FAIL (`Cannot find module './campi'`).

- [ ] **Step 3: Scrivere `campi.ts`**

```ts
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
  | (Base & { tipo: "intero"; min: number; max: number; unita?: string })
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
      { nome: "floor", etichetta: "Piano", tipo: "intero", min: -2, max: 60, aiuto: "0 per il piano terra, numeri negativi per i seminterrati." },
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
```

- [ ] **Step 4: Scrivere `validazione.ts`**

```ts
import { documenti, isVisibile, type Campo, type Sezione } from "@/lib/profilo/campi";
import type { Documenti, RispostaDocumento } from "@/lib/supabase/tipi";

export type EsitoValidazione = {
  /** Valori pronti per il database (colonne della sezione). */
  valori: Record<string, unknown>;
  /** Messaggi per campo (chiave = nome del campo). */
  errori: Record<string, string>;
  /** Valori così come inviati, per ricompilare il modulo dopo un errore. */
  inviati: Record<string, string>;
};

const risposteValide: RispostaDocumento[] = ["si", "no", "non_so"];
/** Cifre con separatori italiani (punti, spazi) e unità finali tollerate. */
const formatoIntero = /^-?\d+$/;

function leggiInviati(sezione: Sezione, formData: FormData) {
  const inviati: Record<string, string> = {};
  for (const campo of sezione.campi) {
    if (campo.tipo === "documenti") {
      for (const d of documenti) inviati[`documents.${d.codice}`] = String(formData.get(`documents.${d.codice}`) ?? "");
    } else {
      inviati[campo.nome] = String(formData.get(campo.nome) ?? "");
    }
  }
  return inviati;
}

function validaCampo(campo: Campo, grezzo: string, inviati: Record<string, string>): { valore: unknown; errore?: string } {
  switch (campo.tipo) {
    case "testo": {
      const testo = campo.multilinea ? grezzo.trim() : grezzo.trim().replace(/\s+/g, " ");
      if (!testo) return { valore: null };
      if (testo.length > campo.max) return { valore: null, errore: `Massimo ${campo.max} caratteri.` };
      if (campo.nome === "phone" && !/^\+?[0-9 ().-]{6,20}$/.test(testo)) {
        return { valore: null, errore: "Controlla il numero di telefono." };
      }
      return { valore: testo };
    }
    case "intero": {
      const pulito = grezzo.replace(/[\s.€]|m²|mq/gi, "");
      if (!pulito) return { valore: null };
      if (!formatoIntero.test(pulito)) return { valore: null, errore: "Inserisci un numero intero." };
      const numero = Number(pulito);
      if (numero < campo.min || numero > campo.max) {
        return { valore: null, errore: `Inserisci un valore tra ${campo.min} e ${campo.max}.` };
      }
      return { valore: numero };
    }
    case "scelta":
      if (!grezzo) return { valore: null };
      return campo.opzioni.some((o) => o.valore === grezzo)
        ? { valore: grezzo }
        : { valore: null, errore: "Scegli una delle opzioni." };
    case "sino":
      if (grezzo === "si") return { valore: true };
      if (grezzo === "no") return { valore: false };
      return { valore: null };
    case "data": {
      if (!grezzo) return { valore: null };
      const data = new Date(`${grezzo}T12:00:00Z`);
      const valida = /^\d{4}-\d{2}-\d{2}$/.test(grezzo) && !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === grezzo;
      return valida ? { valore: grezzo } : { valore: null, errore: "Inserisci una data valida." };
    }
    case "documenti": {
      const risposte: Documenti = {};
      for (const d of documenti) {
        const r = inviati[`documents.${d.codice}`];
        if (!r) continue;
        if (!risposteValide.includes(r as RispostaDocumento)) return { valore: {}, errore: "Risposta non valida." };
        risposte[d.codice] = r as RispostaDocumento;
      }
      return { valore: risposte };
    }
  }
}

/** Legge e valida i campi di una sezione; i campi condizionali non applicabili diventano null. */
export function validaSezione(sezione: Sezione, formData: FormData): EsitoValidazione {
  const inviati = leggiInviati(sezione, formData);
  const valori: Record<string, unknown> = {};
  const errori: Record<string, string> = {};

  for (const campo of sezione.campi) {
    if (!isVisibile(campo, inviati)) {
      valori[campo.nome] = null;
      continue;
    }
    const { valore, errore } = validaCampo(campo, inviati[campo.nome] ?? "", inviati);
    if (errore) errori[campo.nome] = errore;
    else if (campo.obbligatorio && (valore === null || (typeof valore === "string" && valore.length < 2))) {
      errori[campo.nome] = `Inserisci ${campo.etichetta.toLowerCase()}.`;
    } else valori[campo.nome] = valore;
  }
  return { valori, errori, inviati };
}
```

- [ ] **Step 5: Eseguire i test** — Run: `npm test` · Expected: tutti PASS.
- [ ] **Step 6: Commit** — `feat(profilo): definizione dei campi e validazione delle sezioni`

---

### Task 3: Completamento

**Files:**
- Create: `src/lib/profilo/completamento.ts`, `src/lib/profilo/completamento.test.ts`

**Interfaces:**
- Consumes: `sezioni`, `inModulo`, `isVisibile`, `documenti` da `campi.ts`; `Profilo`, `Immobile` da `tipi.ts`.
- Produces: `calcolaCompletamento(profilo: Partial<Profilo>, immobile: Partial<Immobile> | null): { percentuale: number; sezioni: { id: IdSezione; titolo: string; completa: boolean }[] }` — percentuale intera 0–100, media delle frazioni compilate delle sezioni che contano; `valoriSezione(sezione, profilo, immobile): Record<string, string>` (valori del modulo di una sezione).

- [ ] **Step 1: Test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { calcolaCompletamento } from "./completamento";

const tutteDoc = { atto_provenienza: "si", planimetria: "si", visura: "no", ape: "non_so", agibilita: "si", spese_condominiali: "si" } as const;

test("profilo vuoto senza immobile: solo nome e cognome contano", () => {
  const { percentuale, sezioni } = calcolaCompletamento({ first_name: "Mario", last_name: "Rossi" }, null);
  assert.ok(percentuale > 0 && percentuale < 15);
  assert.equal(sezioni.length, 4); // le note non contano
  assert.ok(sezioni.every((s) => !s.completa));
});

test("le condizionali non applicabili non contano", () => {
  const immobile = {
    ownership: "unico", inherited: false, mortgage: "nessuno", occupancy: "libero",
    compliance_doubts: "no", building_bonus_works: false, documents: tutteDoc,
  };
  const { sezioni } = calcolaCompletamento({}, immobile);
  assert.equal(sezioni.find((s) => s.id === "situazione")?.completa, true);
});

test("le condizionali applicabili vuote rendono incompleta la sezione", () => {
  const immobile = {
    ownership: "cointestato", inherited: false, mortgage: "nessuno", occupancy: "libero",
    compliance_doubts: "no", building_bonus_works: false, documents: tutteDoc,
  };
  assert.equal(calcolaCompletamento({}, immobile).sezioni.find((s) => s.id === "situazione")?.completa, false);
});

test("documenti completi solo con tutte le risposte", () => {
  const base = { ownership: "unico", inherited: false, mortgage: "nessuno", occupancy: "libero", compliance_doubts: "no", building_bonus_works: false };
  assert.equal(calcolaCompletamento({}, { ...base, documents: { ape: "si" } }).sezioni.find((s) => s.id === "situazione")?.completa, false);
});

test("false conta come risposta", () => {
  const { sezioni } = calcolaCompletamento({}, { valuation_done: false, sale_timeline: "entro_3_mesi", sale_reason: "altro", linked_purchase: "no", expected_price: 200000, listed_before: "no" });
  assert.equal(sezioni.find((s) => s.id === "obiettivi")?.completa, true);
});
```

- [ ] **Step 2: Run** `npm test` → FAIL (modulo mancante).
- [ ] **Step 3: Implementazione**

```ts
import { documenti, inModulo, isVisibile, sezioni, type IdSezione, type Sezione } from "@/lib/profilo/campi";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

/** Valori del modulo di una sezione, letti dal profilo o dall'immobile. */
export function valoriSezione(sezione: Sezione, profilo: Partial<Profilo>, immobile: Partial<Immobile> | null) {
  const origine = (sezione.tabella === "profiles" ? profilo : (immobile ?? {})) as Record<string, unknown>;
  const valori: Record<string, string> = {};
  for (const campo of sezione.campi) {
    if (campo.tipo === "documenti") {
      const risposte = (origine.documents ?? {}) as Record<string, string>;
      for (const d of documenti) valori[`documents.${d.codice}`] = risposte[d.codice] ?? "";
    } else valori[campo.nome] = inModulo(campo, origine[campo.nome]);
  }
  return valori;
}

export type Completamento = {
  percentuale: number;
  sezioni: { id: IdSezione; titolo: string; completa: boolean }[];
};

/** Percentuale = media delle frazioni compilate delle sezioni che contano (note escluse). */
export function calcolaCompletamento(profilo: Partial<Profilo>, immobile: Partial<Immobile> | null): Completamento {
  const risultato = sezioni
    .filter((s) => s.contaNelCompletamento)
    .map((sezione) => {
      const valori = valoriSezione(sezione, profilo, immobile);
      const campi = sezione.campi.filter((c) => isVisibile(c, valori));
      const compilati = campi.filter((c) =>
        c.tipo === "documenti" ? documenti.every((d) => valori[`documents.${d.codice}`]) : valori[c.nome] !== "",
      ).length;
      return { id: sezione.id, titolo: sezione.titolo, frazione: campi.length ? compilati / campi.length : 1 };
    });
  const media = risultato.reduce((somma, s) => somma + s.frazione, 0) / risultato.length;
  return {
    percentuale: Math.round(media * 100),
    sezioni: risultato.map(({ id, titolo, frazione }) => ({ id, titolo, completa: frazione === 1 })),
  };
}
```

- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Commit** — `feat(profilo): calcolo della percentuale di completamento`

---

### Task 4: Lettura dati e azione di salvataggio

**Files:**
- Create: `src/lib/profilo/dati.ts`, `src/app/dashboard/profilo/azioni.ts`

**Interfaces:**
- Produces:
  - `leggiProfiloCompleto(): Promise<{ profilo: Profilo; immobile: Immobile | null }>` (utente corrente, `cache`)
  - `leggiProfiloCliente(userId: string): Promise<{ profilo: Profilo; immobile: Immobile | null } | null>` (admin, client con RLS)
  - `type StatoSezione = { errori: Record<string, string>; inviati?: Record<string, string>; salvatoIl?: number; erroreGenerale?: string }`
  - `salvaSezione(idSezione: IdSezione, stato: StatoSezione, formData: FormData): Promise<StatoSezione>`

- [ ] **Step 1: `dati.ts`**

```ts
import "server-only";

import { cache } from "react";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { creaClientServer } from "@/lib/supabase/server";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

/** Profilo e immobile dell'utente collegato. */
export const leggiProfiloCompleto = cache(async () => {
  const profilo = await leggiProfiloCorrente();
  const supabase = await creaClientServer();
  const { data: immobile } = await supabase.from("properties").select("*").eq("user_id", profilo.id).maybeSingle();
  return { profilo, immobile: immobile ?? null };
});

/** Profilo e immobile di un cliente, per l'admin (la RLS consente la lettura solo agli admin). */
export async function leggiProfiloCliente(userId: string): Promise<{ profilo: Profilo; immobile: Immobile | null } | null> {
  const supabase = await creaClientServer();
  const [{ data: profilo }, { data: immobile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("properties").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  return profilo ? { profilo, immobile: immobile ?? null } : null;
}
```

- [ ] **Step 2: `azioni.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { sezionePerId, type IdSezione } from "@/lib/profilo/campi";
import { validaSezione } from "@/lib/profilo/validazione";
import { creaClientServer } from "@/lib/supabase/server";

export type StatoSezione = {
  errori: Record<string, string>;
  inviati?: Record<string, string>;
  /** Momento dell'ultimo salvataggio riuscito (mostra "Salvato"). */
  salvatoIl?: number;
  erroreGenerale?: string;
};

/**
 * Salva una sezione del profilo. L'utente è sempre quello collegato (mai un
 * id dal browser); la RLS e i grant per colonna limitano comunque cosa può
 * scrivere. La riga dell'immobile nasce al primo salvataggio.
 */
export async function salvaSezione(idSezione: IdSezione, _stato: StatoSezione, formData: FormData): Promise<StatoSezione> {
  const sezione = sezionePerId(idSezione);
  if (!sezione) return { errori: {}, erroreGenerale: "Sezione non valida." };

  const { valori, errori, inviati } = validaSezione(sezione, formData);
  if (Object.keys(errori).length > 0) return { errori, inviati };

  const profilo = await leggiProfiloCorrente();
  const supabase = await creaClientServer();
  const { error } =
    sezione.tabella === "profiles"
      ? await supabase.from("profiles").update(valori).eq("id", profilo.id)
      : await supabase.from("properties").upsert({ ...valori, user_id: profilo.id }, { onConflict: "user_id" });

  if (error) {
    console.error(`Salvataggio della sezione ${idSezione} non riuscito`, error);
    return { errori: {}, inviati, erroreGenerale: "Non siamo riusciti a salvare. Riprova tra poco." };
  }

  revalidatePath("/dashboard/profilo");
  revalidatePath("/dashboard");
  return { errori: {}, salvatoIl: Date.now() };
}
```

- [ ] **Step 3:** `npx tsc --noEmit && npx eslint src/lib/profilo src/app/dashboard/profilo` → nessun errore.
- [ ] **Step 4: Prova manuale dell'azione**: script `tsx` (stub `server-only` come nelle prove precedenti) non applicabile perché usa la sessione; la prova avviene in Task 5 dal browser in locale. Qui solo tipi e lint.
- [ ] **Step 5: Commit** — `feat(profilo): lettura dei dati e salvataggio delle sezioni`

---

### Task 5: Pagina del cliente

**Files:**
- Create: `src/app/dashboard/profilo/page.tsx`, `src/app/dashboard/profilo/sezione-profilo.tsx`, `src/app/dashboard/profilo/campo-profilo.tsx`, `src/app/dashboard/profilo/riepilogo-completamento.tsx`
- Modify: `src/components/layout/nav-items.ts` (togliere `disabilitata: true` da Profilo), `src/app/dashboard/page.tsx` (riquadro dopo `</header>`)

**Interfaces:**
- Consumes: `leggiProfiloCompleto`, `calcolaCompletamento`, `valoriSezione`, `sezioni`, `salvaSezione`, `StatoSezione`.

- [ ] **Step 1: `campo-profilo.tsx`** (client) — rende un campo per tipo:
  - `testo`: `Input` (o `textarea` con le stesse classi di `Input` e `min-h-28` se `multilinea`), `autoComplete` dal campo.
  - `intero`: `Input` con `inputMode="numeric"` e unità a destra (`span` assoluto) se presente.
  - `scelta` con ≤ 4 opzioni e `sino`: gruppo di pulsanti radio (`fieldset` + `legend`, `input type="radio" className="peer sr-only"` + `label` stilizzata `rounded-lg border px-3 py-2 peer-checked:border-primary peer-checked:bg-primary/10`); per `sino` le opzioni sono Sì/No. Un link "Cancella risposta" (`button type="button"`) azzera la scelta.
  - `scelta` con > 4 opzioni: `SelectNativa` con prima opzione vuota "Scegli…".
  - `data`: `Input type="date"`.
  - `documenti`: tabella responsive — per ogni documento una riga con etichetta e 3 radio (`risposteDocumento`), nome `documents.<codice>`.
  - Ogni campo: `Label`, `aiuto` in `text-sm text-muted-foreground`, errore `role="alert"` con `aria-invalid`/`aria-describedby`. Props: `{ campo: Campo; valore: string; errore?: string; onCambia?: (nome: string, valore: string) => void }`.

```tsx
"use client";

import type { Campo } from "@/lib/profilo/campi";
import { documenti, risposteDocumento } from "@/lib/profilo/campi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativa } from "@/components/ui/select-nativa";
import { cn } from "@/lib/utils";

type Props = { campo: Campo; valore: string; valori: Record<string, string>; errore?: string; onCambia: (nome: string, valore: string) => void };

const pillola =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg border px-3.5 py-2 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 text-muted-foreground hover:bg-muted";

function Pillole({ nome, opzioni, valore, onCambia, descritto }: { nome: string; opzioni: { valore: string; etichetta: string }[]; valore: string; onCambia: Props["onCambia"]; descritto?: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-describedby={descritto}>
      {opzioni.map((o) => (
        <span key={o.valore}>
          <input type="radio" id={`${nome}-${o.valore}`} name={nome} value={o.valore} checked={valore === o.valore} onChange={() => onCambia(nome, o.valore)} className="peer sr-only" />
          <label htmlFor={`${nome}-${o.valore}`} className={pillola}>{o.etichetta}</label>
        </span>
      ))}
      {valore && (
        <button type="button" onClick={() => onCambia(nome, "")} className="px-1 text-sm text-muted-foreground underline-offset-4 hover:underline">
          Cancella
        </button>
      )}
      {/* Con nessuna scelta il campo arriva vuoto al server. */}
      {!valore && <input type="hidden" name={nome} value="" />}
    </div>
  );
}

export function CampoProfilo({ campo, valore, valori, errore, onCambia }: Props) {
  const id = `campo-${campo.nome}`;
  const idAiuto = campo.aiuto ? `${id}-aiuto` : undefined;
  const idErrore = errore ? `${id}-errore` : undefined;
  const descritto = [idAiuto, idErrore].filter(Boolean).join(" ") || undefined;
  const aria = { "aria-invalid": errore ? (true as const) : undefined, "aria-describedby": descritto };
  const etichetta = (
    <>
      {campo.etichetta}
      {campo.obbligatorio && <span className="text-destructive"> *</span>}
    </>
  );
  const aiuto = campo.aiuto && <p id={idAiuto} className="text-sm text-muted-foreground">{campo.aiuto}</p>;
  const messaggio = errore && <p id={idErrore} role="alert" className="text-sm text-destructive">{errore}</p>;

  if (campo.tipo === "documenti") {
    return (
      <fieldset className="space-y-3 sm:col-span-2">
        <legend className="text-sm font-medium">{campo.etichetta}</legend>
        {aiuto}
        <ul className="divide-y rounded-lg border">
          {documenti.map((d) => (
            <li key={d.codice} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm">{d.etichetta}</span>
              <Pillole nome={`documents.${d.codice}`} opzioni={risposteDocumento} valore={valori[`documents.${d.codice}`] ?? ""} onCambia={onCambia} />
            </li>
          ))}
        </ul>
        {messaggio}
      </fieldset>
    );
  }

  if (campo.tipo === "sino" || (campo.tipo === "scelta" && campo.opzioni.length <= 4)) {
    const opzioni = campo.tipo === "sino" ? [{ valore: "si", etichetta: "Sì" }, { valore: "no", etichetta: "No" }] : [...campo.opzioni];
    return (
      <fieldset className="space-y-2 sm:col-span-2">
        <legend className="text-sm font-medium">{etichetta}</legend>
        {aiuto}
        <Pillole nome={campo.nome} opzioni={opzioni} valore={valore} onCambia={onCambia} descritto={descritto} />
        {messaggio}
      </fieldset>
    );
  }

  const largo = campo.tipo === "testo" && (campo.multilinea || campo.max > 80);
  return (
    <div className={cn("space-y-2", largo && "sm:col-span-2")}>
      <Label htmlFor={id}>{etichetta}</Label>
      {campo.tipo === "scelta" ? (
        <SelectNativa id={id} name={campo.nome} value={valore} onChange={(e) => onCambia(campo.nome, e.target.value)} {...aria}>
          <option value="">Scegli…</option>
          {campo.opzioni.map((o) => <option key={o.valore} value={o.valore}>{o.etichetta}</option>)}
        </SelectNativa>
      ) : campo.tipo === "testo" && campo.multilinea ? (
        <textarea id={id} name={campo.nome} value={valore} maxLength={campo.max} onChange={(e) => onCambia(campo.nome, e.target.value)} {...aria}
          className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3.5 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30" />
      ) : (
        <div className="relative">
          <Input id={id} name={campo.nome} value={valore} onChange={(e) => onCambia(campo.nome, e.target.value)} {...aria}
            type={campo.tipo === "data" ? "date" : "text"}
            inputMode={campo.tipo === "intero" ? "numeric" : undefined}
            autoComplete={campo.tipo === "testo" ? (campo.autocomplete ?? "off") : "off"}
            className={campo.tipo === "intero" && campo.unita ? "pr-12" : undefined} />
          {campo.tipo === "intero" && campo.unita && (
            <span aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted-foreground">{campo.unita}</span>
          )}
        </div>
      )}
      {aiuto}
      {messaggio}
    </div>
  );
}
```

- [ ] **Step 2: `sezione-profilo.tsx`** (client) — modulo controllato: stato `valori` inizializzato dai valori salvati; dopo un errore riparte da `stato.inviati`; campi non visibili (`isVisibile`) non resi; `useActionState(salvaSezione.bind(null, sezione.id), { errori: {} })`; "Salvato" per 3 s dopo `salvatoIl`.

```tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";

import { salvaSezione, type StatoSezione } from "@/app/dashboard/profilo/azioni";
import { CampoProfilo } from "@/app/dashboard/profilo/campo-profilo";
import { Button } from "@/components/ui/button";
import { isVisibile, sezionePerId, type IdSezione } from "@/lib/profilo/campi";

export function SezioneProfilo({ idSezione, iniziali, completa }: { idSezione: IdSezione; iniziali: Record<string, string>; completa: boolean }) {
  const sezione = sezionePerId(idSezione)!;
  const [stato, azione, inCorso] = useActionState<StatoSezione, FormData>(salvaSezione.bind(null, idSezione), { errori: {} });
  const [valori, setValori] = useState(iniziali);
  const [mostraSalvato, setMostraSalvato] = useState(false);

  // Dopo un errore il modulo mostra i valori inviati (React azzera i moduli dopo l'invio).
  useEffect(() => { if (stato.inviati) setValori(stato.inviati); }, [stato.inviati]);
  useEffect(() => {
    if (!stato.salvatoIl) return;
    setMostraSalvato(true);
    const t = setTimeout(() => setMostraSalvato(false), 3000);
    return () => clearTimeout(t);
  }, [stato.salvatoIl]);

  const cambia = (nome: string, valore: string) => setValori((v) => ({ ...v, [nome]: valore }));

  return (
    <section id={`sezione-${sezione.id}`} aria-labelledby={`titolo-${sezione.id}`} className="scroll-mt-24 rounded-xl border bg-card p-5 text-card-foreground sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 id={`titolo-${sezione.id}`} className="text-lg font-semibold">{sezione.titolo}</h2>
          <p className="text-sm text-muted-foreground">{sezione.descrizione}</p>
        </div>
        {sezione.contaNelCompletamento && completa && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <CheckIcon className="size-3.5" aria-hidden /> Completa
          </span>
        )}
      </header>
      <form action={azione} noValidate className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {sezione.campi.filter((c) => isVisibile(c, valori)).map((campo) => (
            <CampoProfilo key={campo.nome} campo={campo} valore={valori[campo.nome] ?? ""} valori={valori} errore={stato.errori[campo.nome]} onCambia={cambia} />
          ))}
        </div>
        {stato.erroreGenerale && <p role="alert" className="text-sm text-destructive">{stato.erroreGenerale}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={inCorso}>{inCorso ? "Salvataggio…" : "Salva"}</Button>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {mostraSalvato && <span className="inline-flex items-center gap-1"><CheckIcon className="size-4 text-primary" aria-hidden /> Salvato</span>}
          </p>
        </div>
      </form>
    </section>
  );
}
```

Nota: con campi controllati (`value`) React non perde i valori dopo l'invio; `useEffect` su `inviati` copre il caso del rimontaggio.

- [ ] **Step 3: `riepilogo-completamento.tsx`** (server) — riquadro con percentuale, barra (`role="progressbar"`, `aria-valuenow`), messaggio dei Global Constraints, pillole-link `#sezione-<id>` con ✓ o cerchio vuoto.

```tsx
import { CheckCircle2Icon, CircleIcon } from "lucide-react";

import type { Completamento } from "@/lib/profilo/completamento";

export function RiepilogoCompletamento({ completamento }: { completamento: Completamento }) {
  const { percentuale, sezioni } = completamento;
  return (
    <section aria-labelledby="titolo-completamento" className="rounded-xl border bg-card p-5 text-card-foreground sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titolo-completamento" className="font-semibold">Profilo completo al {percentuale}%</h2>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentuale} aria-labelledby="titolo-completamento" className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percentuale}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Più informazioni ci dai, più Guido può aiutarti in modo concreto: capire il valore della tua casa, i documenti che mancano e i tempi giusti per vendere.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {sezioni.map((s) => (
          <li key={s.id}>
            <a href={`#sezione-${s.id}`} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
              {s.completa ? <CheckCircle2Icon className="size-4 text-primary" aria-hidden /> : <CircleIcon className="size-4 text-muted-foreground" aria-hidden />}
              {s.titolo}
              <span className="sr-only">{s.completa ? "(completa)" : "(da completare)"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: `page.tsx`**

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import { RiepilogoCompletamento } from "@/app/dashboard/profilo/riepilogo-completamento";
import { SezioneProfilo } from "@/app/dashboard/profilo/sezione-profilo";
import { sezioni } from "@/lib/profilo/campi";
import { calcolaCompletamento, valoriSezione } from "@/lib/profilo/completamento";
import { leggiProfiloCompleto } from "@/lib/profilo/dati";

export const metadata: Metadata = { title: "Profilo" };

export default function PaginaProfilo() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Il tuo profilo</h1>
        <p className="text-muted-foreground">Compila le sezioni quando vuoi: ognuna si salva da sola.</p>
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento…</p>}>
        <Contenuto />
      </Suspense>
    </div>
  );
}

async function Contenuto() {
  const { profilo, immobile } = await leggiProfiloCompleto();
  const completamento = calcolaCompletamento(profilo, immobile);
  return (
    <>
      <RiepilogoCompletamento completamento={completamento} />
      <p className="text-sm text-muted-foreground">
        Email dell&apos;account: <span className="font-medium text-foreground">{profilo.email}</span> (non modificabile) · Comunicazioni promozionali: {profilo.marketing_consent ? "sì" : "no"}
      </p>
      {sezioni.map((sezione) => (
        <SezioneProfilo
          key={sezione.id}
          idSezione={sezione.id}
          iniziali={valoriSezione(sezione, profilo, immobile)}
          completa={completamento.sezioni.find((s) => s.id === sezione.id)?.completa ?? false}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 5: Dashboard** — in `src/app/dashboard/page.tsx` dopo `</header>`: componente asincrono `CompletaProfilo` in `Suspense` (fallback `null`) che legge `leggiProfiloCompleto()`, calcola la percentuale e, se < 100, mostra un riquadro `riquadro` con titolo "Completa il tuo profilo", la percentuale, una barra sottile, una frase breve ("Aiuta Guido a conoscere te e la tua casa.") e `Button` link a `/dashboard/profilo`.
- [ ] **Step 6: Menu** — in `nav-items.ts` togliere `disabilitata: true` dalla voce Profilo.
- [ ] **Step 7: Verifica**: `npx next build`, `npx tsc --noEmit`, `npx eslint src`; in locale con `npm run dev`, accesso con link generato (`generaLinkAccesso`) per un utente di prova: compilare ogni sezione, provare un errore (m² = 5) e verificare che i valori restino, cambiare "cointestata" → "unico" e verificare in DB che `owners_count` torni `null`; pulizia dell'utente.
- [ ] **Step 8: Commit** — `feat(profilo): pagina del profilo a sezioni con percentuale di completamento`

---

### Task 6: Admin — colonna e popup

**Files:**
- Create: `src/app/admin/utenti/profilo-utente.tsx`
- Modify: `src/app/admin/utenti/page.tsx`

**Interfaces:**
- Consumes: `sezioni`, `etichettaValore`, `calcolaCompletamento`; `Profilo`, `Immobile`.
- Produces: `ProfiloUtente({ profilo, immobile }: { profilo: Profilo; immobile: Immobile | null })` (server component con `Dialog`).

- [ ] **Step 1:** in `page.tsx` la select dei profili diventa `select("*")`; dopo gli acquisti si leggono gli immobili degli utenti in elenco (`.from("properties").select("*").in("user_id", ids)`) in una `Map`; nuova colonna **Profilo** (dopo Acquisti) con `<ProfiloUtente profilo={utente} immobile={immobili.get(utente.id) ?? null} />`; `min-w-[60rem]`.
- [ ] **Step 2:** `profilo-utente.tsx`: trigger `Button variant="ghost" size="sm"` con "N%"; `DialogContent sm:max-w-2xl` con titolo nome + email, poi per ogni sezione un `<dl>` a due colonne con `etichettaValore(campo, valore)` (campi vuoti mostrati come "—", documenti con `whitespace-pre-line`), sezioni personali dal profilo (più email, data accettazione privacy, consenso marketing), le altre dall'immobile; in fondo il pulsante **"Scarica scheda cliente"**: `Button render={<a href={`/admin/utenti/${profilo.id}/scheda.pdf`} />} nativeButton={false}` con icona `DownloadIcon`.
- [ ] **Step 3:** build/tsc/lint; verifica visiva in locale come admin (popup con profilo di prova pieno e con immobile `null`).
- [ ] **Step 4: Commit** — `feat(admin): completamento e dati del profilo nella tabella utenti`

---

### Task 7: PDF "Scheda cliente"

**Files:**
- Create: `src/lib/profilo/scheda-pdf.tsx`, `src/app/admin/utenti/[id]/scheda.pdf/route.ts`
- Modify: `package.json` (`npm i @react-pdf/renderer@4.9.0`), `next.config.ts` (`serverExternalPackages: ["@react-pdf/renderer"]` se la build lo richiede)

**Interfaces:**
- Consumes: `leggiProfiloCliente`, `sezioni`, `etichettaValore`, `calcolaCompletamento`; acquisti da `purchases`.
- Produces: `generaSchedaPdf(dati: { profilo: Profilo; immobile: Immobile | null; acquisti: { product: string; status: string; amount_total: number | null; paid_at: string | null }[] }): Promise<Buffer>`.

- [ ] **Step 1: `scheda-pdf.tsx`** — documento A4 con `@react-pdf/renderer` (`Document`, `Page`, `View`, `Text`, `Image`, `StyleSheet`, `renderToBuffer`): intestazione con logo (`public/email/logo.png` letto con `fs` come buffer), "Scheda cliente", nome, email, telefono, completamento %; poi per ogni sezione un titolo blu `#2b5bd7` e righe etichetta/valore (solo campi compilati; sezione senza dati → "Non compilata"); sezione "Acquisti"; piè di pagina "Generata il <data> · Riservata: contiene dati personali" con numero di pagina (`render={({ pageNumber, totalPages }) => …}`); font Helvetica.
- [ ] **Step 2: route**

```ts
import { NextResponse } from "next/server";

import { richiediAdmin } from "@/lib/auth/admin";
import { leggiProfiloCliente } from "@/lib/profilo/dati";
import { generaSchedaPdf } from "@/lib/profilo/scheda-pdf";
import { creaClientServer } from "@/lib/supabase/server";

/** Scheda cliente in PDF per Guido (solo admin). */
export async function GET(_request: Request, { params }: RouteContext<"/admin/utenti/[id]/scheda.pdf">) {
  await richiediAdmin();
  const { id } = await params;
  const dati = await leggiProfiloCliente(id);
  if (!dati) return new NextResponse("Cliente non trovato", { status: 404 });

  const supabase = await creaClientServer();
  const { data: acquisti } = await supabase
    .from("purchases").select("product, status, amount_total, paid_at").eq("user_id", id).neq("status", "in_attesa").order("created_at");

  try {
    const pdf = await generaSchedaPdf({ ...dati, acquisti: acquisti ?? [] });
    const nome = [dati.profilo.first_name, dati.profilo.last_name].filter(Boolean).join("-") || "cliente";
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="scheda-${nome.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (errore) {
    console.error("Generazione della scheda cliente non riuscita", errore);
    return new NextResponse("Generazione del PDF non riuscita", { status: 500 });
  }
}
```

(Verificare che `richiediAdmin` reindirizzi i non admin; il proxy già protegge `/admin`.)

- [ ] **Step 3:** build; in locale come admin scaricare il PDF di un profilo pieno e di uno vuoto e aprirli (Read del PDF per controllo visivo); `curl` senza sessione → redirect all'accesso.
- [ ] **Step 4: Commit** — `feat(admin): scheda cliente in PDF dal popup del profilo`

---

### Task 8: Chiusura

- [ ] Spuntare le voci della Fase 8 nel `TODO.md` (tranne GDPR, parte successiva), push, chiedere all'utente la prova online (smartphone + admin + PDF). Versione e tag solo a fase completa (dopo la parte GDPR), secondo `CLAUDE.md`.
