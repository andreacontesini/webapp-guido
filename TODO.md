# Progetto: Web App "Vendere Casa da Privato"

## Fase 1: Inizializzazione & Design System
- [ ] Inizializzare Next.js (App Router, TypeScript, Tailwind CSS)
- [ ] Configurare shadcn/ui per i componenti dell'interfaccia (Button, Card, Dialog, Table, Input, ecc.)
- [ ] Creare layout base mobile-first per l'Area Clienti e layout dedicato per `/admin`
<!-- - [ ] Configurare variabili d'ambiente (`.env.local`) per Supabase, Stripe, Bunny e Resend -->

## Fase 2: Database & Autenticazione (Supabase)
- [ ] Definire schema SQL su Supabase:
  - `profiles`: id, email, full_name, role ('admin' | 'client'), current_session_id, created_at
  - `products`: id, name, slug ('guida' | 'corso' | 'bundle'), price, is_active
  - `purchases`: id, user_id, product_id, stripe_session_id, amount, status, created_at
  - `modules`: id, title, order_index
  - `lessons`: id, module_id, title, description, bunny_video_id, order_index, is_preview (boolean)
  - `attachments`: id, lesson_id, file_name, storage_path
  - `guide_settings`: id, title, description, storage_path, updated_at
- [ ] Configurare Row Level Security (RLS) su tutte le tabelle
- [ ] Implementare autenticazione passwordless via Magic Link (Supabase Auth + Resend)
- [ ] Implementare blocco sessione simultanea: tracciamento `current_session_id` con invalidazione sessioni precedenti

## Fase 3: Area Amministrazione (`/admin`)
- [ ] Protezione della rotta `/admin` tramite middleware (solo utenti con `role: admin`)
- [ ] Dashboard metriche: totale vendite, incasso complessivo, numero clienti attivi
- [ ] Gestione Utenti:
  - Tabella clienti con ricerca, prodotti acquistati e stato
  - Azioni: blocco utente, eliminazione, revoca o assegnazione manuale permessi
  - Visualizzazione storico transazioni Stripe
- [ ] Gestione Guida PDF:
  - Form per modificare titolo, descrizione e prezzo
  - Upload/Sostituzione del file PDF su Supabase Storage privato
- [ ] Gestione Videocorso:
  - Creazione/modifica/riordino di moduli e lezioni
  - Direct Upload video verso Bunny Stream con progress bar
  - Toggle "Lezione introduttiva / Preview gratuita"
  - Upload allegati scaricabili per ogni singola lezione

## Fase 4: Area Riservata Cliente (`/dashboard`)
- [ ] Home utente mobile-first con due sezioni: "La tua guida" e "Il tuo videocorso"
- [ ] Sezione Guida:
  - Stato di blocco/sblocco in base agli acquisti
  - Visualizzatore PDF in-app protetto (se sbloccata)
  - Banner di upgrade non invasivo per acquistare il corso
- [ ] Sezione Videocorso:
  - Elenco moduli e lezioni numerate
  - Lezione 1 accessibile a chi possiede solo la guida
  - Lezioni successive bloccate con lucchetto e pulsante di sblocco rapido
  - Player video Bunny Stream integrato
  - Sezione download per modelli e allegati associati alla lezione

## Fase 5: Integrazione Checkout & Webhook (Stripe)
- [ ] Creazione sessioni Stripe Checkout per i prodotti (Guida, Corso, Bundle, Upgrade)
- [ ] Webhook Stripe (`/api/webhooks/stripe`):
  - Verifica firma webhook
  - Registrazione acquisto nella tabella `purchases`
  - Creazione o aggiornamento account utente
  - Invio automatico email con Magic Link di benvenuto tramite Resend
- [ ] Flusso di upgrade interno con email cliente precompilata al checkout

## Fase 6: Rifinitura & Deploy
- [ ] Configurazione PWA (manifest.json, icone per "Aggiungi a schermata Home")
- [ ] Test end-to-end: acquisto fittizio -> ricezione email -> accesso -> sblocco contenuti
- [ ] Deploy su Vercel con configurazione domini e webhook live