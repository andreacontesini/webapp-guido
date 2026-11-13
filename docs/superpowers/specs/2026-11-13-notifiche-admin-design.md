# Notifiche agli admin — design (Fase 9)

Data: 13/11/2026 · Stato: sviluppato in autonomia, da rivedere con l'utente

## Obiettivo

Gli admin (e destinatari esterni, es. il commercialista) ricevono via email (Resend) gli eventi importanti dell'app. Ogni notifica legata a un cliente ha il "Rispondi a" impostato sull'email del cliente. Il cliente può chiedere di essere ricontattato da Guido dal proprio profilo.

### Decisioni prese (in autonomia, da confermare)

| Tema | Scelta |
|---|---|
| Attivazione degli eventi | Per destinatario: ogni evento si riceve o no (sempre subito). Un evento è disattivato se nessuno lo riceve |
| Riepilogo periodico | Escluso: la voce è stata tolta dal TODO durante lo sviluppo. Le notifiche sono solo immediate |
| Destinatari iniziali | La migrazione aggiunge gli admin esistenti, con tutti gli eventi |
| Un'email per destinatario | Sì: nessun indirizzo esposto agli altri destinatari |
| Doppioni | Ogni evento ha una chiave unica nello storico (es. `acquisto:<sessione>`): webhook ripetuti o pagina di conferma e webhook insieme non mandano due email |
| Profilo aggiornato | Al massimo una notifica per cliente al giorno (salvare cinque sezioni non manda cinque email) |
| Invio | Dopo la risposta (`after` di Next): l'operazione principale non aspetta e non fallisce se l'email non parte. Errori nello storico |
| Storico | Ultimi 30 giorni in admin; le righe più vecchie si cancellano a ogni nuovo invio |
| Link "Apri la scheda del cliente" | Apre `/admin/utenti?q=<email>` (non esiste una scheda dedicata) |
| Ricontatto | Colonne su `profiles`; preferenze di contatto riprese dai dati personali; l'admin la segna come gestita |

## Eventi

| Codice | Quando | Chiave di deduplica |
|---|---|---|
| `nuovo_account` | registrazione autonoma (primo clic sul Magic Link), creazione da acquisto senza account, creazione da admin | `nuovo_account:<user>` |
| `primo_accesso` | dati base e privacy salvati in /benvenuto | `primo_accesso:<user>` |
| `acquisto` | prima registrazione dell'acquisto (prodotto, importo, cliente, landing) | `acquisto:<sessione>` |
| `pagamento_in_attesa` | checkout completato ma non pagato (metodo differito) o `async_payment_failed` | `pagamento_in_attesa:<sessione>:<esito>` |
| `rimborso` | rimborso totale e accesso revocato | `rimborso:<pagamento>` |
| `contestazione_aperta` | urgente, con scadenza per le prove | `contestazione_aperta:<dispute>` |
| `contestazione_chiusa` | vinta o persa | `contestazione_chiusa:<dispute>` |
| `profilo_aggiornato` | salvataggio di una sezione | `profilo_aggiornato:<user>:<giorno>` |
| `richiesta_ricontatto` | il cliente chiede di essere ricontattato | `richiesta_ricontatto:<user>:<istante>` |
| `richiesta_gdpr` | scaricamento dei dati o eliminazione dell'account | `richiesta_gdpr:<tipo>:<user>:<minuto>` |
| `problema_tecnico` | email al cliente non partita, errore del webhook Stripe | per evento |

## Dati

Migrazione `supabase/migrations/20261119090000_notifiche_admin.sql`.

- `admin_notification_recipients`: `email` (unica, minuscola), `name`, `paused`, `events` (codici degli eventi ricevuti), timestamp. RLS: solo admin (lettura e scrittura).
- `admin_notification_log`: `event`, `dedupe_key` (unica), `subject`, `user_id` (set null), `customer_email`, `data` jsonb, `recipients` text[], `status` (`in_invio`·`inviata`·`parziale`·`non_inviata`·`nessun_destinatario`), `error`, `created_at`. RLS: solo lettura admin, scrittura service role. Ci finiscono anche le prove (`prova`).
- `profiles`: `contact_request_at`, `contact_request_notes` (≤ 1000), `contact_request_handled_at`. Il cliente può scrivere le prime due (grant per colonna), la terza solo l'admin (service role).

## Codice

- `src/lib/notifiche/eventi.ts` (puro, testato): catalogo degli eventi, chiavi di deduplica, contenuto di ogni notifica (oggetto, righe, urgenza).
- `src/lib/notifiche/invia.ts`: `notificaAdmin(evento, dati)` (mai errori, registra nello storico) e `notificaDopo(...)` (con `after`).
- `src/emails/notifica-admin.tsx`.
- `/admin/notifiche`: destinatari (aggiungi, modifica eventi, pausa, rimuovi, invia prova) e storico.
- Profilo: riquadro "Vuoi parlare con Guido?"; admin: badge e filtro "Da ricontattare", dettaglio nel popup del profilo, "Segna come gestita".

## Da fare a mano

- Applicare la migrazione al database (da Claude con `SUPABASE_DB_URL`, bloccata in autonomia).
- Stripe: aggiungere l'evento `checkout.session.async_payment_failed` all'endpoint del webhook.
