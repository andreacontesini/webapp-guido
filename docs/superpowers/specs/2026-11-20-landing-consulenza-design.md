# Landing della consulenza: pulsanti configurabili, barra fissa, modulo di contatto

**Data:** 20/11/2026 · **Versione:** 0.12.0

Obiettivo: ricreare nell'app la landing della consulenza di Guido (oggi su WordPress, `guidocontesini.it/vendi-casa-da-privato/`) e rendere le landing capaci di qualcosa di diverso dalla sola vendita della guida.

## Decisioni prese con l'utente

- **Modulo di contatto** come nuovo blocco: nell'editor si scelgono i campi (quali, in che ordine, obbligatori o no) e i destinatari.
- **Notifica** con evento dedicato **"Richieste landing"**: riguarda solo i messaggi arrivati dai moduli delle landing.
- **Testi e comportamento dei pulsanti** gestibili per ogni landing.
- **Barra fissa su smartphone** facoltativa, con testo e pulsante scelti nell'editor.
- **Media**: tutti i file (immagini e video brevi) si caricano dall'editor nel bucket pubblico `landing` di Supabase. Video lunghi o pesanti su Bunny Stream.
- **Video della landing**: compresso sotto i 10 MB e caricato nel bucket; da spostare su Bunny Stream quando sarà attivo (voce in TODO).

## Pulsanti configurabili

Un pulsante ha: testo, azione, destinazione, stile (principale o secondario).

| Azione | Cosa fa | Destinazione |
| --- | --- | --- |
| `acquista` | apre il pagamento della guida | — |
| `sezione` | scorre a un blocco della pagina (es. il modulo) | id del blocco, scelto da un elenco |
| `link` | apre un indirizzo | `https://…`, `/percorso`, `mailto:` o `tel:` (i link esterni in una nuova scheda) |
| `accedi` | porta all'accesso all'area riservata | — |

Dove si usano:
- apertura: pulsante principale e secondario;
- invito: pulsante obbligatorio;
- video, tappe, testo, autore, elenco, punti chiave: pulsante facoltativo sotto il blocco;
- prezzo: solo il testo del pulsante (l'azione resta l'acquisto).

**Compatibilità:** le landing salvate prima di questa versione non hanno i nuovi campi. Una funzione di conversione (`aggiornaFormatoBlocco`) li ricava dal vecchio formato (`azione` dell'invito, `pulsanteAcquisto` del video, apertura con "Acquista" + "Scopri cosa contiene"), sia nella pagina pubblica sia all'apertura nell'editor. La landing esistente resta identica finché non la si modifica.

## Apertura (hero): media a destra

Scelta tra copertina della guida (predefinita, come oggi), immagine, video o niente. Il video in apertura parte da solo, senza audio, in ripetizione, con i controlli visibili. Formato scelto nell'editor (16:9, 9:16, 1:1).

## Barra fissa su smartphone

Nuova colonna `landing_pages.mobile_bar` (jsonb): `{ attiva, titolo, testo, pulsante }`. Se è `null` (landing esistenti) si comporta come oggi: barra di acquisto se la landing vende la guida.

## Blocco "Elenco"

Titolo, testo introduttivo, voci, stile del simbolo (spunta, croce, domanda) e pulsante facoltativo. Serve per "Il problema", "perfetto per te se" e "non funzionerà se".

## Blocco "Modulo di contatto"

- **Campi a scelta**, nell'ordine indicato: nome e cognome, email, telefono, città, messaggio. Per ciascuno: etichetta e obbligatorio sì/no. Serve almeno email o telefono, altrimenti il blocco è incompleto.
- **Privacy**: casella obbligatoria con link a `/privacy`, sempre presente.
- **Testi**: titolo, testo, testo del pulsante di invio, messaggio di conferma.
- **Destinatari**: elenco di email del blocco, in aggiunta a chi in `/admin/notifiche` riceve l'evento "Richieste landing".
- **Sicurezza e spam**: il server rilegge la configurazione del blocco dal database (mai dal browser), quindi i destinatari non si possono falsificare. Campo nascosto anti-bot, tempo minimo di compilazione, massimo 3 invii in 10 minuti per la stessa email o lo stesso telefono. Solo landing pubblicate; in anteprima il modulo non invia.

### Dati

Tabella `landing_requests`: landing, blocco, nome, email, telefono, città, messaggio, consenso privacy (data), creata il, gestita il / da. RLS: lettura, modifica ed eliminazione solo admin; inserimento solo dal server (service role).

Statistiche: nuovo tipo di evento `contatto` in `landing_events`; `statistiche_landing` restituisce anche `richieste`.

### Notifica

Evento `richiesta_landing` ("Richieste landing", gruppo "Profilo e richieste"). L'email riporta landing e campi compilati; "Rispondi a" sull'email del cliente, se c'è. Pulsante verso `/admin/richieste`. La migrazione aggiunge l'evento ai destinatari esistenti.

### Admin

Nuova sezione **Richieste** (`/admin/richieste`): elenco con data, landing, dati e messaggio, telefono ed email cliccabili, filtro "da gestire / tutte", "Segna come gestita" ed eliminazione. Avviso nella Panoramica con il numero di richieste da gestire.

## Privacy

Nuova voce per i dati del modulo: finalità (rispondere alla richiesta e organizzare la consulenza), base giuridica (misure precontrattuali richieste dall'interessato), conservazione 24 mesi dall'ultimo contatto.

## Media

Il bucket `landing` accetta anche `video/mp4` e `video/webm` (sempre max 10 MB). Nell'editor il campo video ha il pulsante "Carica video".

## Landing creata

`/vendi-casa-da-privato`, in bozza, con i testi della pagina WordPress: apertura con video, il problema, la soluzione, "Mi chiamo Guido Contesini…" con il ritratto, i 4 passaggi, per chi è e per chi non è, "Prima di decidere come vendere casa, parliamone." con il modulo (città, nome e cognome, telefono, email). Ogni "Prenota una consulenza gratuita" scorre al modulo; barra fissa con lo stesso pulsante.
