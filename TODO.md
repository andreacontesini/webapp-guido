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
- [x] Pagine di ritorno da Stripe Checkout (anticipate dalla Fase 5, solo grafica): conferma e annullato, con email di assistenza `contesiniconsulenze@gmail.com`.

### Fase 4: Area Amministrazione Base
- [x] **Accesso solo per chi ha diritto:** chi si registra liberamente non deve vedere guida né corso. `guide_access` di default `false`; in beta l'accesso lo assegna l'admin (o un elenco di email beta), poi lo sblocca il pagamento (Fase 5).
- [x] Per gli utenti senza accesso: home e pagina guida con pulsante "Acquista la guida" (apre il popup di acquisto, Fase 5) invece di "Non attiva".
- [x] Proteggere la rotta `/admin` (solo `role: admin`).
- [x] Gestione Utenti: visualizzazione lista, blocco utente, eliminazione, revoca/assegnazione permessi.
- [x] Creazione utenti dall'area admin (account già confermato, guida e ruolo admin opzionali, email con link di accesso via Resend; al primo accesso l'utente accetta la privacy con i dati precompilati).
  - [x] Verificare che su Vercel ci siano `RESEND_API_KEY` ed `EMAIL_FROM` (formato `Nome <indirizzo>`), poi provare una creazione con invio dell'email.
- [x] Gestione Guida PDF: upload del file su Supabase Storage e aggiornamento dettagli.
- [x] Prendi spunto dalla sezione id="hero" del sito a questo link https://finorio.demo.nextjstemplates.com/ e ricomponi la pagina iniziale dell'app. Non ho bisogno di pulsanti particolari o header / footer, ma semplicemente contenuti e bottone che rimanda alla pagina di accesso / login
- [x] Pagina 404 con lo stile della pagina iniziale (sfondo condiviso in `SfondoHero`).

### Fase 5: Pagamento base con Stripe (Target: v0.5.0)
> ✅ Completata il 12/11/2026 con la sandbox Stripe dell'account del cliente.
- [x] Prezzo della guida definito (89 €, in `src/lib/prodotti.ts`) e chiavi Stripe Test Mode dell'account del cliente in `.env.local` e su Vercel. Prodotto e prezzo non vanno creati a mano: li crea il checkout (vedi `docs/stripe.md`).
- [x] Endpoint webhook di test creato nel pannello Stripe (`/api/webhooks/stripe`, eventi `checkout.session.completed` e `checkout.session.async_payment_succeeded`) e `STRIPE_WEBHOOK_SECRET` su Vercel.
- [x] Tabella `purchases` (acquisti: utente, prodotto, sessione Stripe, importo, stato) con RLS: l'utente vede solo i propri acquisti.
- [x] Popup "Acquista la guida": prezzo reale e pulsante che apre Stripe Checkout (pagamento ospitato da Stripe: i dati della carta non passano dall'app), con email dell'utente precompilata e ricevuta automatica. *Provato online in Test Mode.*
- [x] Aspetto della pagina di pagamento Stripe vicino allo stile dell'app (logo, colori, font e angoli dalle impostazioni di branding dell'account Stripe). *Colori impostati in sandbox; logo, icona, nome pubblico ed email di assistenza da completare nell'account live (Fase 10).*
- [x] Webhook Stripe (`/api/webhooks/stripe`): a pagamento confermato registra l'acquisto e sblocca `guide_access` (mai lato client), gestendo gli eventi duplicati. *Provato in locale con eventi firmati: firma non valida, pagamento, duplicato, non pagato.*
- [x] ~~Test di un acquisto completo in locale (carte di prova, webhook con Stripe CLI): popup con pulsante attivo, pagina Stripe, ritorno, sblocco, email di conferma, riga in `purchases`.~~ *Superato dal test online: la Stripe CLI non si installa (Command Line Tools non compatibili con macOS 26).*
- [x] Stesso test online su `app.guidocontesini.it` in Test Mode: popup a 89 €, pagina Stripe, ritorno alla conferma, webhook, riga in `purchases`, sblocco ed email di conferma (12/11/2026).
- [x] **Tag Versione:** `v0.5.0`.

### Fase 6: Rimborsi, ritorno da Stripe e acquisti in admin (Target: v0.6.0)
- [x] Revoca automatica dell'accesso in caso di rimborso o contestazione del pagamento (webhook: `charge.refunded` solo se totale, `charge.dispute.created`, `charge.dispute.closed` con ripristino se vinta). *Provato in locale con eventi firmati.*
- [x] Pagine di ritorno (logica): la conferma verifica il `session_id` con Stripe lato server (solo se la sessione è dell'utente collegato) e, se pagata, registra e sblocca subito senza aspettare il webhook; pagamenti differiti mostrano "Pagamento in elaborazione". Lo sblocco non ridà mai l'accesso a un acquisto rimborsato o contestato.
- [x] Pagina "Pagamento annullato": pulsante "Riprova" che riapre il popup di acquisto (non mostrato se il prodotto è già attivo; mantiene la landing di origine per le statistiche).
- [ ] Area admin: elenco acquisti nella scheda utente e assegnazione manuale ancora possibile.
- [ ] Test in Test Mode di pagamento annullato, rimborso e contestazione.
- [ ] **Tag Versione:** `v0.6.0`.

### Fase 7: Acquisto senza account (Target: v0.7.0)
- [ ] Stripe Checkout apribile anche senza login: Stripe chiede l'email del cliente.
- [ ] Il webhook crea l'account e sblocca la guida; se l'email appartiene a un account già esistente, sblocca la guida su quello invece di crearne uno nuovo.
- [ ] Accesso immediato all'app dalla pagina di conferma (link di accesso generato dopo la verifica del pagamento) e, in ogni caso, email con il link di accesso.
- [ ] **Restyle delle email** con uno stile moderno e professionale, coerente con l'app (logo, colori, tipografia, pulsante ben visibile, piè di pagina con contatti e assistenza):
  - [x] Modelli di Supabase Auth (link di accesso, conferma registrazione, cambio email) generati da React Email in `supabase/templates/` con `npm run email:supabase`.
  - [ ] Modelli copiati nel pannello Supabase (Authentication → Emails → Templates, vedi `docs/supabase-auth.md`) e provati con un accesso reale.
  - [x] Email inviate dall'app con Resend costruite con React Email (`src/emails/`, invio con `src/lib/email/invia.ts`): conferma acquisto (già inviata dal webhook), account creato dall'admin. La variante con link di accesso per l'acquisto senza account si collega con questa fase.
  - [ ] Controllo dell'aspetto nei principali client (Gmail, Apple Mail, Outlook, smartphone) e in tema scuro.
- [ ] Test: acquisto senza account, con email già registrata, pagamento annullato.
- [ ] **Tag Versione:** `v0.7.0`.

### Fase 8: Landing di vendita della guida (Target: v0.8.0)
- [x] Tabella `landing_pages` (indirizzo/slug, titolo, testi SEO, blocchi di contenuto, stato bozza/pubblicata, pagina iniziale) con RLS: chiunque legge le landing pubblicate, solo l'admin le bozze e le modifiche.
- [x] Blocchi predefiniti con lo stile dell'app (`src/lib/landing/blocchi.ts`, `src/components/landing/`): hero, punti chiave, contenuti della guida (tappe), testo libero, immagine, testimonianze, chi è l'autore, domande frequenti, prezzo con pulsante "Acquista", invito all'acquisto o all'accesso.
- [x] Pagine pubbliche delle landing (`/<slug>`, in cache e aggiornate subito dalle azioni admin) e scelta della landing da usare come pagina iniziale in `/admin/landing` (insieme a pubblica/ritira). Senza landing scelta resta la pagina iniziale predefinita.
  - [ ] Scegliere in `/admin/landing` se usare la prima landing come pagina iniziale.
- [x] **Prima landing di vendita** (`/guida-vendere-casa-da-privato`), ottimizzata per la conversione:
  - Hero con promessa chiara e pulsante "Acquista la guida" ben visibile (ripetuto lungo la pagina e fisso in basso su smartphone).
  - Vantaggi dell'acquisto (niente sorprese, prezzo giusto, metodo, incasso netto).
  - Elenco brevissimo dei temi trattati (le 7 tappe della guida, una riga ciascuna).
  - Chi è l'autore, domande frequenti, prezzo e garanzie (pagamento sicuro Stripe, accesso immediato). Testimonianze non inserite: non ce ne sono ancora di reali.
  - [ ] Il pulsante porta direttamente a Stripe Checkout senza passare dal login (flusso della Fase 7): oggi apre il popup di acquisto, che con i pagamenti attivi chiede l'accesso.
- [x] Contenuti con dati reali presi dalla guida v1.0 (7 tappe, 8 controlli, 18 pagine, presentazione dell'autore); nessun numero di utenti o valutazione.
  - [ ] Aggiungere il prezzo quando definito (il blocco prezzo lo legge da `src/lib/prodotti.ts`) ed eventualmente una foto dell'autore e testimonianze vere.
- [x] SEO e condivisione: titolo, descrizione, URL canonico e immagine di anteprima per ogni landing (generata dall'app se manca), `sitemap.xml` e `robots.txt`.
- [x] Landing pronte a spostarsi sul dominio principale: per ora vivono su `app.guidocontesini.it` (il dominio principale ospita il sito WordPress, da non toccare), ma URL canonici, sitemap e link verso l'area riservata usano due variabili d'ambiente separate (`NEXT_PUBLIC_LANDING_URL`, facoltativa, e `NEXT_PUBLIC_APP_URL`) invece di indirizzi scritti nel codice. I link di ritorno da Stripe restano sull'app.
- [ ] **Tag Versione:** `v0.8.0` (dopo le Fasi 5-7).

### Fase 9: Editor delle landing in admin (Target: v0.9.0)
- [x] Elenco landing in admin (`/admin/landing`): crea (nasce in bozza con apertura e prezzo), modifica, anteprima, duplica, elimina con conferma, pubblica/ritira, pagina iniziale.
- [x] Editor dei blocchi (`/admin/landing/modifica?id=…`): impostazioni (nome, indirizzo, titolo e descrizione SEO, immagine di anteprima), aggiungi/modifica/duplica/elimina/riordina i blocchi, avviso per i blocchi incompleti (salvati ma nascosti nella pagina) e per le modifiche non salvate.
- [x] Anteprima prima della pubblicazione (`/anteprima/<id>`, solo admin, non indicizzata): mostra l'ultima versione salvata anche delle bozze, senza contare visite.
- [x] Caricamento immagini per le landing: bucket pubblico `landing` su Supabase Storage (max 10 MB, JPG/PNG/WebP/AVIF/GIF), caricamento diretto dal browser con URL firmato, oppure indirizzo incollato.
  - [ ] Pulizia delle immagini non più usate (oggi restano nel bucket anche dopo l'eliminazione di una landing).
- [x] Misurazione delle conversioni (visite landing → checkout avviati → acquisti), anonima e senza cookie: tabella `landing_events` (solo landing, tipo e data), visite inviate dalla pagina, checkout dal popup di acquisto, acquisti dal webhook Stripe. Statistiche degli ultimi 30 giorni nell'elenco admin.
  - [ ] Verificare le statistiche di checkout e acquisto con Stripe attivo (Fase 5) e con l'acquisto senza account (Fase 7, il checkout dovrà portarsi dietro la landing di origine).
- [x] **Nuovo blocco Video**:
  - Sorgente riconosciuta dall'indirizzo: Bunny Stream (link di embed o di riproduzione), YouTube (dominio senza cookie), Vimeo, file MP4/WebM.
  - Impostazioni: titolo e testo, copertina, formato (16:9, 9:16, 1:1), avvio automatico (sempre senza audio), audio disattivato, ripetizione, controlli, sottotitoli, secondo di partenza, pulsante "Acquista" sotto il video.
  - Player per smartphone: copertina leggera al posto del player, caricamento al tocco o quando il video entra nello schermo, riproduzione nella pagina (`playsinline`), pulsante play da 80 px, spazio riservato dal formato (nessun salto del layout); streaming adattivo dai player di Bunny/YouTube/Vimeo.
  - [ ] Nascondere i controlli funziona con YouTube, Vimeo e file diretti; con Bunny dipende dalle impostazioni del player nella libreria Bunny.
- [x] **Nuovo blocco Galleria immagini**:
  - Griglia (2-4 colonne, una su smartphone) con ingrandimento a schermo intero, frecce e tasti freccia.
  - Carosello a scorrimento nativo: trascinamento su smartphone, frecce su desktop, indicatori di posizione, scorrimento automatico facoltativo (si ferma al tocco, al passaggio del mouse e con "riduci animazioni").
  - Testo alternativo e didascalia per ogni immagine; caricamento differito.
- [ ] **Tag Versione:** `v0.9.0` (dopo le Fasi 5-7).

### Fase 10: Lancio della Guida (Target: v1.0.0)
- [ ] Aspetti legali e fiscali da verificare con il cliente/commercialista: condizioni di vendita, rinuncia al recesso per contenuti digitali (casella nel checkout), emissione della fattura (la ricevuta Stripe non è una fattura), privacy e cookie.
- [ ] Test end-to-end: Magic Link, permessi PDF, redirect, acquisto, rimborso, acquisto da landing senza account.
- [ ] Passaggio di Stripe alle chiavi live e webhook di produzione.
  - [ ] Branding nell'account live: logo e icona (`public/email/logo.png`), colori `#2b5bd7` / `#0f1e33`, nome pubblico ed email di assistenza `contesiniconsulenze@gmail.com`.
- [ ] Deploy su Vercel (app.guidocontesini.it) e controllo finale su smartphone e desktop.
- [ ] **Tag Versione:** rilascio `v1.0.0` (prima versione pubblica, solo guida).

---

## 🔵 VERSIONE 2.x (Focus: Videocorso)
**Sviluppo su un branch separato (`videocorso`), unito a `main` solo a corso completo e testato.** Fino ad allora in app il videocorso resta "In arrivo".

### Fase 11: Database Videocorso
- [ ] Estendere DB: tabelle `modules`, `lessons`, `attachments`; prodotto videocorso in `purchases`.
- [ ] Configurare RLS per i nuovi contenuti (accesso legato allo stato di acquisto).

### Fase 12: Admin Videocorso - Moduli e video
- [ ] Integrazione Bunny Stream API nel back office.
- [ ] Interfaccia per creazione moduli e lezioni.
- [ ] "Direct Upload" dei video dall'app verso Bunny.net.

### Fase 13: Admin Videocorso - Allegati
- [ ] Upload di file allegati (modelli/documenti) associati alle lezioni.

### Fase 14: Area Cliente - Sblocco Video
- [ ] Rimuovere "Coming Soon" e attivare la lista moduli/lezioni.
- [ ] Lezione 1: preview gratuita accessibile a chi possiede solo la guida.
- [ ] Player video integrato (Bunny Stream) con logiche di protezione.
- [ ] Area download documenti per le singole lezioni.

### Fase 15: Pagamenti Videocorso & Upgrade
- [ ] Acquisto del videocorso (stesso flusso Stripe della guida).
- [ ] Banner e flussi di upgrade (es. da "Solo Guida" a "Videocorso Completo") interni all'app.
- [ ] Blocchi landing dedicati al videocorso.

### Fase 16: Lancio Videocorso (Target: v2.0.0)
- [ ] Configurazione PWA (manifest, icone).
- [ ] Test end-to-end del videocorso e dei pagamenti.
- [ ] Merge del branch `videocorso` in `main` e rilascio `v2.0.0`.

---

## ⚪ IN FUTURO: Landing sul dominio principale
Quando il sito WordPress su `guidocontesini.it` verrà dismesso.
- [ ] **Scelta del dominio per ogni landing:** permettere all'admin di decidere su quale dominio pubblicare ciascuna landing (es. `guidocontesini.it` o `app.guidocontesini.it`), con URL canonico, sitemap e smistamento nel proxy coerenti. Oggi tutte le landing stanno sul dominio dell'app (o su quello di `NEXT_PUBLIC_LANDING_URL`, uguale per tutte).
  - [x] Select «Pubblica su» nell'editor della landing (App / Dominio principale), salvata nella colonna `landing_pages.domain` (enum `dominio_landing`, predefinito `app`). L'opzione «Dominio principale» è visibile ma disattivata e il server la rifiuta.
  - [ ] Attivare l'opzione «Dominio principale» (`attivo: true` in `src/lib/landing/domini.ts`) e usare `domain` di ogni landing per URL canonico, sitemap, link nell'admin e smistamento nel proxy (una landing risponde solo sul suo dominio).
- [ ] Aggiungere `guidocontesini.it` e `www` al progetto Vercel (record A su DNS Aruba) e aggiornare la variabile d'ambiente con l'indirizzo delle landing.
- [ ] Smistamento per dominio nel proxy: sul dominio principale solo le landing, il resto (`/login`, `/admin`, area riservata) rimandato su `app.guidocontesini.it`.
- [ ] Redirect 301 dalle vecchie pagine WordPress che hanno traffico o posizionamento.
- [ ] Escludere `app.guidocontesini.it` dall'indicizzazione e aggiornare l'URL di ritorno in Stripe.
