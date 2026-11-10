# Progetto: Web App "Vendere Casa da Privato"
**Dominio:** app.guidocontesini.it
**Stack:** Next.js, Tailwind, shadcn/ui, Supabase, Resend, Stripe, Bunny.net

---

## 🟢 FASE BETA (Focus: Core, Auth & Guida PDF)

### Fase 1: Setup & Design System
- [ ] Inizializzare Next.js (App Router, TS, Tailwind CSS).
- [ ] Configurare shadcn/ui (solo in lingua italiana).
- [ ] Creare layout base mobile-first per `/dashboard` e layout desktop per `/admin`.
- [ ] Configurare `.env.local` e il `.gitignore`.

### Fase 2: Database & Autenticazione Core
- [ ] Configurare schema base su Supabase (`profiles`, `guide_settings`).
- [ ] Implementare Row Level Security (RLS) protettiva.
- [ ] Implementare Login/Registrazione con Magic Link via Supabase Auth + Resend.
- [ ] Blocco sessioni simultanee (tracciamento `current_session_id`).

### Fase 3: Area Riservata Cliente (Beta UI)
- [ ] Sviluppare Home utente con 2 sezioni principali: "La tua guida" e "Il tuo videocorso".
- [ ] **Videocorso (Placeholder):** Disegnare la sezione videocorso bloccata con badge "Coming Soon".
- [ ] **Guida PDF:**
  - Sviluppare visualizzatore PDF in-app protetto.
  - Logica di accesso (abilitata di default per gli utenti beta o sbloccabile manualmente da admin).

### Fase 4: Area Amministrazione Base
- [ ] Proteggere la rotta `/admin` (solo `role: admin`).
- [ ] Gestione Utenti: visualizzazione lista, blocco utente, eliminazione, revoca/assegnazione permessi.
- [ ] Gestione Guida PDF: upload del file su Supabase Storage e aggiornamento dettagli.

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
- [ ] Integrazione Stripe Checkout.
- [ ] Webhook Stripe (`/api/webhooks/stripe`) per creazione/aggiornamento utenti e sblocco permessi.
- [ ] Banner e flussi di upgrade (es. da "Solo Guida" a "Videocorso Completo") interni all'app.

### Fase 10: Ottimizzazione & Lancio Definitivo (Target: v1.4.0)
- [ ] Configurazione PWA (manifest, icone).
- [ ] Test flussi di pagamento in Test Mode.
- [ ] Passaggio variabili live per il lancio al pubblico.


Comando Claude

Ciao Claude! Lavoriamo nella repo "webapp-guido".
Ho inserito il nuovo file TODO.md nella root del progetto.

Iniziamo con la FASE 1 della BETA:
1. Inizializza Next.js (App Router, TS, Tailwind CSS).
2. Configura shadcn/ui.
3. Prepara i layout (clienti mobile-first e /admin).
4. Verifica che .gitignore escluda .env.local.
5. Quando hai testato la build in locale, spunta la Fase 1 nel TODO.md ed esegui un commit git: "feat(beta): setup fase 1 - nextjs e UI".

Fermati dopo la Fase 1 e attendi istruzioni.