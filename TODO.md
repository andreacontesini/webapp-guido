# Progetto: Web App "Vendere Casa da Privato"
**Dominio:** app.guidocontesini.it
**Stack:** Next.js, Tailwind, shadcn/ui, Supabase, Resend, Stripe, Bunny.net

---

## 🟢 FASE BETA (Focus: Core, Auth & Guida PDF)

### Fase 1: Setup & Design System
- [x] Inizializzare Next.js (App Router, TS, Tailwind CSS).
- [x] Configurare shadcn/ui (solo in lingua italiana).
- [x] Creare layout base mobile-first per `/dashboard` e layout desktop per `/admin`.
- [x] Configurare `.env.local` e il `.gitignore`.
- [x] Sistemare tutti gli errori presenti di next
- [x] Pensare un layout più moderno, con sidebar di navigazione e aspetto leggermente più dark
- [x] Dammi le indicazioni per pubblicare il progetto su vercel
- [x] Font: Geist (default del preset shadcn base-nova), classi tipografiche standard
- [x] Nuovo design: sidebar a icone, griglia bento, tema chiaro/scuro selezionabile, accento blu
- [x] Raggi ridotti (base `0.5rem`, pulsanti più squadrati)
- [x] Prima pubblicazione su Vercel con dominio `app.guidocontesini.it` (CNAME su DNS Aruba)
- [x] Errore di idratazione in sviluppo: causato dall'estensione Chrome "Directo", non dal codice (va limitata in `chrome://extensions`)


### Fase 2: Database & Autenticazione Core
- [x] Fix npm warn Unknown env config "cache-dir" (variabile `npm_config_cache_dir` iniettata da Vercel: rimossa in `vercel.json`). This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
- [x] Configurare schema base su Supabase (`profiles`, `guide_settings`).
- [x] Implementare Row Level Security (RLS) protettiva.
- [x] Implementare Login/Registrazione con Magic Link via Supabase Auth + Resend.
- [x] Se al login il cliente è nuovo, richiedi i dati di base per riempire l'account. Il resto dei dati potrà inserirli in futuro nell'area Profilo.
- [x] Blocco sessioni simultanee (tracciamento `current_session_id`): vince l'ultimo accesso, le altre sessioni vengono revocate e chiuse dal proxy.
- [x] Voglio vedere il localhost sempre in localhost:3000 quindi verifica se ci sono sessioni attive, fermale. (`npm run dev` libera la porta 3000 e parte sempre lì)
- [x] Fai in modo che la skin dark sia quella di default del tema
- [x] Aiutami a creare una github action che pinga ogni 3 giorni il db di Supabase in modo che con la licenza base il progetto non si stoppi mai

### Fase 3: Area Riservata Cliente (Beta UI)
- [x] Sviluppare Home utente con 2 sezioni principali: "La tua guida" e "Il tuo videocorso".
- [x] **Videocorso (Placeholder):** Disegnare la sezione videocorso bloccata con badge "Coming Soon".
- [x] **Guida PDF:**
  - Sviluppare visualizzatore PDF in-app protetto.
  - Logica di accesso (abilitata di default per gli utenti beta o sbloccabile manualmente da admin).
- [x] Guida "Una vendita buona e giusta" (v1.0, 18 pagine) caricata nel bucket privato `guida` e attiva per gli utenti.
- [x] Filigrana su ogni pagina: "Guido Contesini - Mediatore immobiliare" con l'email dell'utente in piccolo, leggera e poco fitta.
- [x] Lettore compatibile anche con browser meno recenti (build legacy di pdf.js).
- [x] Pagine di ritorno da Stripe Checkout (anticipate dalla Fase 9, solo grafica): conferma e annullato, con email di assistenza `info@guidocontesini.it`.

### Fase 4: Area Amministrazione Base
- [ ] **Accesso solo per chi ha diritto:** chi si registra liberamente non deve vedere guida né corso. `guide_access` di default `false`; in beta l'accesso lo assegna l'admin (o un elenco di email beta), poi lo sblocca il pagamento (Fase 9).
- [ ] Per gli utenti senza accesso: home e pagina guida con pulsante "Acquista la guida" (apre il popup di acquisto, Fase 9) invece di "Non attiva".
- [x] Proteggere la rotta `/admin` (solo `role: admin`).
- [x] Gestione Utenti: visualizzazione lista, blocco utente, eliminazione, revoca/assegnazione permessi.
- [ ] Gestione Guida PDF: upload del file su Supabase Storage e aggiornamento dettagli.
- [ ] Prendi spunto dalla sezione id="hero" del sito a questo link https://finorio.demo.nextjstemplates.com/ e ricomponi la pagina iniziale dell'app. Non ho bisogno di pulsanti particolari o header / footer, ma semplicemente contenuti e bottone che rimanda alla pagina di accesso / login

### Fase 5: Chiusura Beta & Deploy (Target: v0.9.0-beta)
- [ ] Test end-to-end (ricezione Magic Link, permessi PDF, redirect).
- [ ] Deploy su Vercel (app.guidocontesini.it).
- [ ] **Tag Versione:** Commit finale e rilascio versione `v0.9.0-beta`.

---

## 🔵 VERSIONE 1.x (Focus: Videocorso, Stripe & Upgrade)

### Fase 6: Database Avanzato (v1.0.0)
- [ ] Estendere DB: tabelle `products`, `purchases`, `modules`, `lessons`, `attachments`.
- [ ] Configurare RLS per i nuovi contenuti (accesso legato allo stato di acquisto).

### Fase 7: Area Amministrazione Videocorso (v1.1.0)
- [ ] Integrazione Bunny Stream API nel back office.
- [ ] Sviluppo interfaccia per creazione moduli e lezioni.
- [ ] Implementare "Direct Upload" per i video da app verso Bunny.net.
- [ ] Funzionalità di upload per file allegati (modelli/documenti) associati alle lezioni.

### Fase 8: Area Riservata Cliente - Sblocco Video (v1.2.0)
- [ ] Rimuovere "Coming Soon" e attivare la lista moduli/lezioni.
- [ ] Lezione 1: preview gratuita accessibile a chi possiede solo la guida.
- [ ] Player video integrato (Bunny Stream) con logiche di protezione.
- [ ] Area download documenti per le singole lezioni.

### Fase 9: Automazione Pagamenti (v1.3.0)
- [ ] **Acquisto dalla dashboard (niente pagina prodotti):** al click su "Acquista" si apre un popup con breve descrizione del prodotto, prezzo e pulsante "Acquista" che porta a Stripe Checkout.
- [ ] Integrazione Stripe Checkout (pagamento ospitato da Stripe: i dati della carta non passano dall'app), con email dell'utente precompilata e ricevuta automatica.
- [x] Pagine di ritorno (grafica): **conferma** (`/dashboard/acquisto/conferma`, attende lo sblocco e porta al contenuto) e **annullato** (`/dashboard/acquisto/annullato`, nessun addebito, torna alla dashboard).
- [ ] Pagine di ritorno (logica): collegare `session_id` di Stripe alla verifica dello sblocco.
- [ ] Webhook Stripe (`/api/webhooks/stripe`) per creazione/aggiornamento utenti e sblocco permessi.
- [ ] Sblocco automatico di guida/corso solo a pagamento confermato (mai lato client), con revoca in caso di rimborso.
- [ ] Banner e flussi di upgrade (es. da "Solo Guida" a "Videocorso Completo") interni all'app.

### Fase 10: Ottimizzazione & Lancio Definitivo (Target: v1.4.0)
- [ ] Configurazione PWA (manifest, icone).
- [ ] Test flussi di pagamento in Test Mode.
- [ ] Passaggio variabili live per il lancio al pubblico.