# Profilo del cliente — design (Fase 8)

Data: 12/11/2026 · Stato: da rivedere

## Obiettivo

Il profilo serve a **Guido per conoscere il potenziale cliente**: chi vende, che casa, in che situazione e con quali tempi. Il cliente gestisce i propri dati quando vuole, anche solo per completezza. Tutto è facoltativo tranne i dati base del primo accesso; un messaggio ben visibile spiega che completare il profilo aiuta Guido a seguirlo meglio.

### Decisioni prese

| Tema | Scelta |
|---|---|
| Struttura della pagina | Una pagina a sezioni, ciascuna con il proprio "Salva", e barra di completamento |
| Immobili | Uno per cliente (tabella separata, estendibile in futuro) |
| Documenti | Solo elenco da spuntare (ce l'ho / non ce l'ho / non so), nessun caricamento di file |
| Posizione | Comune, provincia, zona e **via** facoltativa, con la nota "serve solo a Guido per una valutazione più precisa, non viene mostrata a nessun altro" |
| Salvataggio | Colonne vere nel database con valori ammessi controllati (no JSON per sezione) |
| "A che punto sei" (tappa della guida) | Escluso |
| Richiesta di ricontatto | Rimandata alla Fase 9 (Notifiche agli admin) |
| Vista admin | Popup di sola lettura nella tabella utenti + pulsante **"Scarica scheda cliente"** (PDF). Niente scheda dedicata, filtri o CSV |
| Cambio email | Non previsto: l'email resta quella dell'account |
| GDPR (scaricamento dati, eliminazione account) | Fuori da questo spec, parte successiva della Fase 8 |

## Dati

Migrazione `supabase/migrations/20261118090000_profilo_cliente.sql` (applicata da Claude con `SUPABASE_DB_URL`).

### Nuove colonne in `profiles` (tutte facoltative)

| Colonna | Tipo / valori |
|---|---|
| `residence_city` | testo ≤ 80 |
| `residence_province` | testo ≤ 40 |
| `contact_preference` | `telefono` · `whatsapp` · `email` |
| `contact_time` | `mattina` · `pomeriggio` · `sera` · `indifferente` |

### Nuova tabella `properties`

Una riga per cliente (`user_id` unico, `references profiles on delete cascade`), creata al primo salvataggio di una sezione dell'immobile. `created_at`, `updated_at` (trigger `imposta_updated_at` esistente).

Valori ammessi come `text` + `check` (non enum: aggiungere una voce resta una modifica da una riga). Le domande sì/no sono `boolean` nullable: `null` = non risposto. Numeri interi con limiti ragionevoli (`check`).

**La casa**
- `street` (≤ 120), `city` (≤ 80), `province` (≤ 40), `area` (zona/quartiere, ≤ 80)
- `property_type`: `appartamento` · `villa` · `casa_indipendente` · `rustico` · `attico` · `altro`
- `usage`: `abitazione_principale` · `seconda_casa` · `investimento` · `altro`
- `surface_sqm` (10–2000), `rooms` (1–30), `bedrooms` (0–20), `bathrooms` (0–10)
- `floor` (-2–60, 0 = terra), `has_elevator`
- `year_built` (1500–anno corrente)
- `condition`: `da_ristrutturare` · `buono` · `ristrutturato` · `nuovo`
- `energy_class`: `A4` · `A3` · `A2` · `A1` · `B` · `C` · `D` · `E` · `F` · `G` · `non_so`
- `has_garage`, `has_cellar`, `has_garden`, `has_terrace`
- `heating`: `autonomo` · `centralizzato` · `assente` · `non_so`
- `condo_fees_monthly` (0–5000 €)

**Situazione**
- `ownership`: `unico` · `cointestato`; `owners_count` (2–20, solo se cointestato); `owners_agree`: `si` · `no` · `non_so`
- `inherited`; `succession_done`: `si` · `no` · `in_corso` · `non_so` (solo se ereditata)
- `mortgage`: `nessuno` · `mutuo_residuo` · `ipoteca` · `non_so`
- `occupancy`: `libero` · `abitato_proprietario` · `affittato`; `lease_end` (data, solo se affittato)
- `compliance_doubts`: `no` · `si` · `non_so`; `compliance_notes` (≤ 1000)
- `building_bonus_works`

**Documenti**: `documents jsonb` con chiavi fisse `atto_provenienza`, `planimetria`, `visura`, `ape`, `agibilita`, `spese_condominiali` e valori `si` · `no` · `non_so` (check sulla struttura). Unico campo JSON: è un elenco chiuso letto sempre per intero.

**Obiettivi**
- `sale_timeline`: `entro_3_mesi` · `entro_6_mesi` · `entro_12_mesi` · `nessuna_fretta`
- `sale_reason`: `acquisto_altra_casa` · `trasferimento` · `eredita` · `liquidita` · `separazione` · `altro`
- `linked_purchase`: `si` · `no` · `non_so`
- `expected_price` (1 000–20 000 000 €)
- `valuation_done`; `valuation_by` (≤ 120)
- `listed_before`: `no` · `portali_privato` · `agenzia_conclusa` · `agenzia_in_corso`

**Note**: `notes` (≤ 2000).

### Permessi (RLS)

- `properties`: il cliente legge, inserisce e modifica solo la riga con `user_id = auth.uid()`; l'admin legge tutte (`is_admin()`); nessuna policy di delete (arriverà con la parte GDPR).
- `profiles`: le policy esistenti già consentono al cliente di modificare il proprio profilo; si verifica che le nuove colonne non aprano nulla (il cliente non deve poter modificare `role`, `guide_access`, `is_blocked`: controllare la protezione esistente).

## Pagina cliente `/dashboard/profilo`

Voce "Profilo" del menu attivata (oggi `disabilitata`).

1. **Riquadro di completamento** in alto: "Profilo completo al N%", barra, messaggio: *"Più informazioni ci dai, più Guido può aiutarti in modo concreto: capire il valore della tua casa, i documenti che mancano e i tempi giusti per vendere."* e pillole per sezione (✓ completa / da completare) che portano alla sezione.
2. **Sezioni**, ciascuna in una scheda con il proprio modulo e "Salva":
   1. *Dati personali*: nome, cognome, telefono (obbligatori, stesse regole di /benvenuto), residenza, contatto preferito e orario. Email e consenso marketing mostrati in sola lettura (email non modificabile).
   2. *La tua casa*: posizione (con nota sulla via), caratteristiche, pertinenze.
   3. *Situazione e documenti*.
   4. *Obiettivi di vendita*.
   5. *Note per Guido*.
3. **Comportamento**: un'azione server per sezione (`useActionState`), validazione con messaggi in italiano sul singolo campo, "Salvato" a buon fine. Domande condizionali mostrate solo quando servono (proprietari se cointestata, successione se ereditata, fine contratto se affittata). Su smartphone: scelte brevi a pulsanti, `inputMode="numeric"` per numeri e prezzi.
4. **Dashboard**: sotto il 100% un riquadro "Completa il tuo profilo" con percentuale e link.

### Completamento

Calcolato dall'app (`src/lib/profilo/completamento.ts`), non salvato: per ogni sezione l'elenco dei campi che contano (le domande condizionali contano solo se applicabili); la sezione è completa quando tutti i suoi campi hanno un valore; la percentuale è la media delle sezioni. Note escluse dal calcolo (facoltative per natura).

## Admin

- Tabella Utenti: nuova colonna **Profilo** con la percentuale; il clic apre un popup di sola lettura con tutti i dati per sezione (via e note comprese), con etichette leggibili (non i codici).
- Nel popup il pulsante **"Scarica scheda cliente"** scarica un PDF (`/admin/utenti/[id]/scheda.pdf`, route solo admin) con intestazione, dati di contatto, immobile, situazione, documenti, obiettivi, note, acquisti e data di generazione. Generato lato server con `@react-pdf/renderer` (nuova dipendenza), nello stile dell'app (logo, colori).

## Codice

- `src/lib/profilo/campi.ts`: definizione unica di campi, valori ammessi ed etichette italiane (usata da moduli, validazione, popup admin e PDF).
- `src/lib/profilo/validazione.ts`: lettura e validazione dei `FormData` per sezione.
- `src/lib/profilo/completamento.ts`: calcolo della percentuale.
- `src/app/dashboard/profilo/`: pagina, sezioni, azioni server.
- `src/app/admin/utenti/profilo-utente.tsx` e route del PDF.
- `src/lib/supabase/tipi.ts`: tipi aggiornati.

## Errori

- Salvataggio non riuscito: messaggio generico nella sezione, dati del modulo conservati.
- Profilo o immobile mancanti: la pagina parte vuota; la riga `properties` nasce con il primo salvataggio (upsert su `user_id`).
- PDF: se la generazione fallisce, risposta 500 con messaggio e log; l'utente non admin riceve 404.

## Prove

- Migrazione applicata; con client autenticati come utenti diversi: un cliente non legge né modifica i dati di un altro, non può cambiare `role`/`guide_access`, l'admin legge tutto.
- Script su validazione (valori validi, non validi, condizionali) e completamento.
- Build e lint.
- Prova online dell'utente: compilazione da smartphone, popup e PDF in admin.

## Fuori da questo spec

- Scaricamento dei propri dati ed eliminazione dell'account (GDPR): parte successiva della Fase 8.
- Richiesta di ricontatto e notifiche: Fase 9.
