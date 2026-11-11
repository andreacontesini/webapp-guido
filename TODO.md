# Progetto: Web App "Vendere Casa da Privato"
**Dominio:** app.guidocontesini.it
**Stack:** Next.js, Tailwind, shadcn/ui, Supabase, Resend, Stripe, Bunny.net

---

## 🟢 VERSIONE 1.0 (Focus: Guida PDF, pagamenti e landing) — branch `main`

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
- [x] Pagine di ritorno da Stripe Checkout (anticipate dalla Fase 9, solo grafica): conferma e annullato, con email di assistenza `contesiniconsulenze@gmail.com`.

### Fase 4: Area Amministrazione Base
- [x] **Accesso solo per chi ha diritto:** chi si registra liberamente non deve vedere guida né corso. `guide_access` di default `false`; in beta l'accesso lo assegna l'admin (o un elenco di email beta), poi lo sblocca il pagamento (Fase 9).
- [x] Per gli utenti senza accesso: home e pagina guida con pulsante "Acquista la guida" (apre il popup di acquisto, Fase 9) invece di "Non attiva".
- [x] Proteggere la rotta `/admin` (solo `role: admin`).
- [x] Gestione Utenti: visualizzazione lista, blocco utente, eliminazione, revoca/assegnazione permessi.
- [x] Gestione Guida PDF: upload del file su Supabase Storage e aggiornamento dettagli.
- [x] Prendi spunto dalla sezione id="hero" del sito a questo link https://finorio.demo.nextjstemplates.com/ e ricomponi la pagina iniziale dell'app. Non ho bisogno di pulsanti particolari o header / footer, ma semplicemente contenuti e bottone che rimanda alla pagina di accesso / login

### Fase 5: Pagamento della Guida con Stripe (Target: v0.5.0)
- [ ] Prezzo della guida definito e prodotto/prezzo creati su Stripe (account del cliente), prima in Test Mode.
- [ ] Tabella `purchases` (acquisti: utente, prodotto, sessione Stripe, importo, stato) con RLS: l'utente vede solo i propri acquisti.
- [ ] Popup "Acquista la guida": prezzo reale e pulsante che apre Stripe Checkout (pagamento ospitato da Stripe: i dati della carta non passano dall'app), con email dell'utente precompilata e ricevuta automatica.
- [ ] Webhook Stripe (`/api/webhooks/stripe`): a pagamento confermato registra l'acquisto e sblocca `guide_access` (mai lato client), gestendo gli eventi duplicati.
- [ ] Revoca automatica dell'accesso in caso di rimborso o contestazione del pagamento.
- [ ] Pagine di ritorno (logica): collegare il `session_id` di Stripe alla verifica dello sblocco.
- [ ] Area admin: elenco acquisti nella scheda utente e assegnazione manuale ancora possibile.
- [ ] Aspetti legali e fiscali da verificare con il cliente/commercialista: condizioni di vendita, rinuncia al recesso per contenuti digitali (casella nel checkout), emissione della fattura (la ricevuta Stripe non è una fattura).
- [ ] Test completi in Test Mode (carte di prova, webhook in locale con Stripe CLI, rimborso).
- [ ] **Tag Versione:** `v0.5.0`.

### Fase 6: Landing gestibili dall'admin (Target: v0.6.0)
- [ ] Tabella `landing_pages` (indirizzo/slug, titolo, testi SEO, blocchi di contenuto, stato bozza/pubblicata).
- [ ] Blocchi predefiniti con lo stile dell'app: hero, punti chiave, contenuti della guida (tappe), testo libero, immagine, testimonianze, domande frequenti, prezzo con pulsante "Acquista", invito all'accesso.
- [ ] Editor nell'area admin: crea, duplica ed elimina landing; aggiungi, modifica e riordina i blocchi; anteprima; pubblica/ritira.
- [ ] Caricamento immagini per le landing (bucket pubblico su Supabase Storage).
- [ ] Pagine pubbliche delle landing e scelta della landing da usare come pagina iniziale (al posto di quella attuale in `src/app/page.tsx`).
- [ ] Acquisto direttamente da una landing anche per chi non ha ancora un account: Stripe Checkout chiede l'email, il webhook crea l'account, sblocca la guida e invia il link di accesso.
- [ ] SEO e condivisione: titolo, descrizione e immagine di anteprima per ogni landing; sitemap.
- [ ] Contenuti delle landing aggiornati con dati reali (tappe, pagine, ecc.); dati come utenti o valutazioni solo se veri.
- [ ] **Tag Versione:** `v0.6.0`.

### Fase 7: Lancio della Guida (Target: v1.0.0)
- [ ] Test end-to-end: Magic Link, permessi PDF, redirect, acquisto, rimborso, acquisto da landing senza account.
- [ ] Passaggio di Stripe alle chiavi live e webhook di produzione.
- [ ] Deploy su Vercel (app.guidocontesini.it) e controllo finale su smartphone e desktop.
- [ ] **Tag Versione:** rilascio `v1.0.0` (prima versione pubblica, solo guida).

---

## 🔵 VERSIONE 2.x (Focus: Videocorso)
**Sviluppo su un branch separato (`videocorso`), unito a `main` solo a corso completo e testato.** Fino ad allora in app il videocorso resta "In arrivo".

### Fase 8: Database Videocorso
- [ ] Estendere DB: tabelle `modules`, `lessons`, `attachments`; prodotto videocorso in `purchases`.
- [ ] Configurare RLS per i nuovi contenuti (accesso legato allo stato di acquisto).

### Fase 9: Area Amministrazione Videocorso
- [ ] Integrazione Bunny Stream API nel back office.
- [ ] Sviluppo interfaccia per creazione moduli e lezioni.
- [ ] Implementare "Direct Upload" per i video da app verso Bunny.net.
- [ ] Funzionalità di upload per file allegati (modelli/documenti) associati alle lezioni.

### Fase 10: Area Riservata Cliente - Sblocco Video
- [ ] Rimuovere "Coming Soon" e attivare la lista moduli/lezioni.
- [ ] Lezione 1: preview gratuita accessibile a chi possiede solo la guida.
- [ ] Player video integrato (Bunny Stream) con logiche di protezione.
- [ ] Area download documenti per le singole lezioni.

### Fase 11: Pagamenti Videocorso & Upgrade
- [ ] Acquisto del videocorso (stesso flusso Stripe della guida).
- [ ] Banner e flussi di upgrade (es. da "Solo Guida" a "Videocorso Completo") interni all'app.
- [ ] Blocchi landing dedicati al videocorso.

### Fase 12: Lancio Videocorso (Target: v2.0.0)
- [ ] Configurazione PWA (manifest, icone).
- [ ] Test end-to-end del videocorso e dei pagamenti.
- [ ] Merge del branch `videocorso` in `main` e rilascio `v2.0.0`.
