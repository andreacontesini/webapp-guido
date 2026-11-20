# Test end-to-end prima del lancio (Fase 12)

Prove da fare su **app.guidocontesini.it in Test Mode di Stripe**, prima di passare alle chiavi live. Per ogni caso: cosa fare, cosa deve succedere. Spunta la casella quando il risultato è quello atteso; se qualcosa non torna, annota cosa hai visto (pagina, messaggio, ora) accanto al caso.

## Preparazione

- [ ] Almeno due email di prova che ricevi davvero (con Gmail vanno bene gli alias: `nome+prova1@gmail.com`, `nome+prova2@gmail.com`).
- [ ] Un account admin collegato su un altro browser (o in una finestra anonima), per controllare utenti, acquisti e notifiche mentre provi.
- [ ] In `/admin/notifiche` almeno un destinatario attivo con tutti gli eventi.
- [ ] Uno smartphone (meglio uno iPhone e uno Android) e un computer.
- [ ] Dashboard Stripe aperta in **modalità test** (Pagamenti), per rimborsi e contestazioni.

Carte di prova (qualsiasi data futura, qualsiasi CVC):

| Carta | Effetto |
| --- | --- |
| `4242 4242 4242 4242` | pagamento riuscito |
| `4000 0025 0000 3155` | richiede la conferma 3D Secure |
| `4000 0000 0000 0002` | pagamento rifiutato |
| `4000 0000 0000 0259` | pagamento riuscito, poi contestazione automatica |

## A. Accesso e account

1. - [x] **Registrazione con email nuova.** Da `/accesso` inserisci l'email di prova 1 e apri il link ricevuto.
   - Atteso: si apre `/benvenuto`; dopo nome, cognome e accettazione della privacy arrivi in dashboard. Senza acquisto la guida non è disponibile e c'è il pulsante "Acquista la guida".
   - Notifiche agli admin: "Nuovo account" (registrazione) e "Primo accesso completato".
2. - [x] **Accesso con account esistente.** Esci e rientra con la stessa email.
   - Atteso: entri direttamente in dashboard, senza ripassare da `/benvenuto`.
3. - [x] **Link già usato.** Riapri lo stesso link di accesso.
   - Atteso: messaggio chiaro e possibilità di chiederne uno nuovo, nessuna pagina di errore tecnico.
4. - [x] **Una sola sessione.** Collegato sul computer, accedi con lo stesso account dallo smartphone, poi torna sul computer e cambia pagina.
   - Atteso: sul computer la sessione è chiusa e torni all'accesso.
5. - [x] **Pagine protette.** Da scollegato apri `/dashboard` e `/admin`; da cliente (non admin) apri `/admin`.
   - Atteso: da scollegato vai all'accesso; da cliente l'admin non è raggiungibile.
6. - [x] **Account bloccato.** Dall'admin blocca l'account di prova 1, poi prova a usarlo.
   - Atteso: non riesce a entrare. Sbloccalo alla fine.

## B. Guida PDF

7. - [x] **Senza accesso.** Con un account senza guida apri `/dashboard/guida`.
   - Atteso: nessun PDF, solo il pulsante di acquisto.
8. - [X] **Con accesso.** Con un account che ha la guida apri il lettore, sul computer e sullo smartphone.
   - Atteso: tutte le pagine si leggono; su ogni pagina la filigrana con nome e la tua email; il PDF non si scarica come file.

## C. Acquisto

9. - [x] **Acquisto da collegato.** Con l'account di prova 1: "Acquista la guida", carta `4242…`.
   - Atteso: popup con il prezzo, pagina Stripe, ritorno su "Pagamento confermato", guida sbloccata subito, email di conferma e ricevuta Stripe.
   - Admin: acquisto visibile nella colonna "Acquisti". Notifica "Acquisto completato".
10. - [x] **Acquisto dalla landing senza account, email nuova.** Da scollegato apri `/guida-vendere-casa-da-privato`, "Acquista", su Stripe usa l'email di prova 2 con nome e cognome.
    - Atteso: dopo il pagamento entri da solo nell'app, `/benvenuto` ha nome e cognome già compilati, poi dashboard con guida attiva. Arriva anche l'email con il link di accesso.
    - Notifiche: "Nuovo account" (da acquisto) e "Acquisto completato" con la landing di provenienza.
    - In `/admin/landing`: per quella landing aumentano visite, checkout avviati e acquisti.
11. - [x] **Acquisto senza account, email già registrata.** Da scollegato acquista dalla landing usando l'email di un account esistente senza guida.
    - Atteso: nessun ingresso automatico (per sicurezza); messaggio che invita a usare il link ricevuto via email; dopo l'accesso la guida è attiva su quell'account, senza account doppi.
12. - [x] **Pagamento annullato.** Su Stripe premi la freccia "indietro", sia da collegato sia da scollegato.
    - Atteso: pagina "Pagamento annullato" con "Riprova", che riapre il pagamento. Nessuno sblocco.
13. - [x] **Carta rifiutata** (`4000 0000 0000 0002`).
    - Atteso: errore mostrato da Stripe, puoi riprovare con un'altra carta; nessuno sblocco e nessun acquisto in admin.
14. - [x] **3D Secure** (`4000 0025 0000 3155`), meglio da smartphone.
    - Atteso: finestra di conferma di Stripe; dopo la conferma l'acquisto si completa come al caso 9.
15. - [x] **Già acquistata.** Con un account che ha già la guida riapri il pulsante di acquisto (es. dalla landing, da collegato).
    - Atteso: nessun secondo pagamento; si va direttamente alla guida.

## D. Rimborsi e contestazioni

16. - [x] **Rimborso totale.** Dalla dashboard Stripe rimborsa per intero un acquisto di prova.
    - Atteso: la guida si disattiva per quell'account; in admin l'acquisto risulta rimborsato; notifica "Rimborso emesso".
17. - [x] **Rimborso parziale.** Rimborsa solo una parte di un altro acquisto.
    - Atteso: la guida resta attiva.
18. - [x] **Contestazione.** Acquista con `4000 0000 0000 0259`.
    - Atteso: subito dopo, la guida viene disattivata e arriva la notifica urgente "Contestazione aperta" con la scadenza e il link a Stripe.
    - Poi su Stripe rispondi alla contestazione con la prova `winning_evidence`: quando risulta vinta la guida torna attiva e arriva la notifica "Contestazione chiusa".

## E. Profilo e richiesta di ricontatto

19. - [x] **Profilo.** Compila tutte le sezioni da smartphone.
    - Atteso: ogni sezione si salva con il suo pulsante; il riquadro mostra cosa manca e arriva al 100% a profilo completo; in dashboard sparisce l'invito a completare il profilo.
    - Notifica "Profilo o immobile aggiornato" al massimo una volta al giorno per cliente.
    - Admin: popup del profilo e "Scarica scheda cliente" (PDF) con i dati inseriti.
20. - [x] **Ricontatto.** Nel profilo compila "Vuoi parlare con Guido?" e invia.
    - Atteso: notifica "Richiesta di ricontatto"; in admin avviso in Panoramica e nella tabella utenti, riga evidenziata, filtro "da ricontattare"; "Segna come gestita" toglie l'avviso.

## F. Dati personali (GDPR)

21. - [x] **Scarica i tuoi dati.** Dal profilo scarica il file.
    - Atteso: file JSON con account, immobile e acquisti; notifica "Richiesta sui dati personali".
22. - [x] **Elimina account.** Con un account di prova scrivi ELIMINA e conferma.
    - Atteso: esci dall'app, arriva l'email di conferma, l'utente sparisce dall'admin ma il suo acquisto resta registrato; notifica agli admin.

## G. Amministrazione

23. - [x] **Crea utente.** Da `/admin/utenti` crea un account con la guida attiva.
    - Atteso: l'utente riceve l'email con il link, al primo accesso accetta la privacy con i dati già compilati; notifica "Nuovo account" (creato da admin).
24. - [x] **Notifiche.** In `/admin/notifiche` usa "Invia prova", metti in pausa un destinatario e controlla lo storico.
    - Atteso: la prova arriva; il destinatario in pausa non riceve gli eventi successivi; lo storico mostra tutti gli invii delle prove precedenti.
25. - [x] **Landing.** Controlla la landing su smartphone e computer: pulsanti verso le sezioni (scorrimento fluido), barra di acquisto fissa su smartphone, link a condizioni, privacy e cookie nel piè di pagina.

## H. Email

26. - [x] **Modelli di Supabase** copiati nel pannello (vedi `docs/supabase-auth.md`): il link di accesso arriva con il nuovo aspetto.
27. - [x] **Aspetto delle email** (accesso, conferma acquisto, account creato, eliminazione, notifiche) in Gmail, Apple Mail e Outlook, da computer e da smartphone, anche in tema scuro.
    - Atteso: logo e pulsante ben visibili, testi leggibili, nessun link rotto.

## Dopo i test

- Annotare in `TODO.md` (Fase 12) i casi superati e aprire una voce per ogni problema trovato.
- Pulire i dati di prova se servono statistiche pulite al lancio (account, acquisti di test, eventi delle landing).
