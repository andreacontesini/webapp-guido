-- =============================================================
-- Fase 8 — Prima landing di vendita della guida
-- Contenuti presi dalla guida "Una vendita buona e giusta" (v1.0):
-- tappe, numeri e presentazione dell'autore sono quelli reali.
-- Niente testimonianze né valutazioni finché non ce ne sono di vere.
-- Pubblicata ma non ancora pagina iniziale: si sceglie in /admin/landing.
-- =============================================================

insert into public.landing_pages (slug, title, seo_title, seo_description, status, published_at, blocks)
values (
  'guida-vendere-casa-da-privato',
  'Guida — vendere casa da privato',
  'Vendere casa da privato: la guida in 7 tappe di Guido Contesini',
  'Una vendita buona e giusta: la guida pratica per vendere casa da privato, dai controlli sull''immobile al rogito. Valutazione, annuncio, visite, trattativa, imposte e costi.',
  'pubblicata',
  now(),
  $blocchi$
[
  {
    "id": "apertura",
    "tipo": "hero",
    "etichetta": "Guida pratica · 7 tappe · 18 pagine",
    "titolo": "Vendi casa da privato,",
    "evidenza": "senza sorprese",
    "sottotitolo": "«Una vendita buona e giusta» è la guida di Guido Contesini, consulente immobiliare sul Lago di Garda: tutto il percorso di vendita, dai controlli sull'immobile al rogito dal notaio, spiegato in modo semplice e con esempi pratici.",
    "nota": "Accesso immediato nella tua area riservata, da smartphone, tablet e computer.",
    "numeri": [
      { "valore": "7", "etichetta": "tappe, dai controlli al rogito" },
      { "valore": "8", "etichetta": "controlli da fare prima di vendere" },
      { "valore": "18", "etichetta": "pagine pratiche, senza giri di parole" }
    ]
  },
  {
    "id": "vantaggi",
    "tipo": "punti-chiave",
    "titolo": "Perché leggerla prima di mettere in vendita",
    "sottotitolo": "Vendere casa non è pubblicare un annuncio e aspettare: è un percorso fatto di documenti, valutazioni, trattative e decisioni importanti.",
    "punti": [
      {
        "icona": "sicurezza",
        "titolo": "Niente sorprese in trattativa",
        "testo": "Gli 8 controlli su provenienza, conformità, impianti, ipoteche e condominio: i problemi li scopri tu, prima di trovare un acquirente, non il notaio."
      },
      {
        "icona": "valore",
        "titolo": "Il prezzo giusto",
        "testo": "Il metodo comparativo, i valori OMI e il calcolo dei metri quadri commerciali per partire dal valore reale, senza gonfiare il prezzo."
      },
      {
        "icona": "metodo",
        "titolo": "Un metodo in ordine",
        "testo": "Ogni tappa prepara la successiva: dall'annuncio alle visite, dalla proposta con caparra confirmatoria fino al rogito."
      },
      {
        "icona": "costi",
        "titolo": "Sai quanto incassi davvero",
        "testo": "Plusvalenza, provvigione, APE e costi tecnici: calcoli l'incasso netto prima di mettere in vendita, non il giorno del rogito."
      }
    ]
  },
  {
    "id": "contenuti",
    "tipo": "tappe",
    "titolo": "Cosa trovi nella guida",
    "sottotitolo": "Il percorso di vendita in 7 tappe. Seguile nell'ordine e arriverai al rogito senza sorprese.",
    "tappe": [
      { "titolo": "Controlli sull'immobile", "testo": "Provenienza, conformità urbanistica e catastale, APE, impianti, ipoteche." },
      { "titolo": "La valutazione", "testo": "Il prezzo giusto, dal valore di mercato reale ai metri quadri commerciali." },
      { "titolo": "La pubblicità sui portali", "testo": "Foto curate e annuncio efficace: il 95% delle richieste arriva da qui." },
      { "titolo": "Richieste e appuntamenti", "testo": "Filtrare i contatti, organizzare le visite, presentare la casa al meglio." },
      { "titolo": "Trattativa e proposta", "testo": "Mettere tutto per iscritto: proposta, caparra confirmatoria, preliminare." },
      { "titolo": "Il rogito notarile", "testo": "L'atto pubblico che trasferisce la proprietà, e cosa fare dopo." },
      { "titolo": "Le imposte e i costi", "testo": "Plusvalenza, provvigione e spese: quanto incassi davvero." }
    ]
  },
  {
    "id": "invito-acquisto",
    "tipo": "invito",
    "titolo": "Parti dalla prima tappa, oggi",
    "testo": "Dopo l'acquisto la guida si apre subito nella tua area riservata: inizia dai controlli sull'immobile prima di pubblicare l'annuncio.",
    "azione": "acquista"
  },
  {
    "id": "autore",
    "tipo": "autore",
    "titolo": "Chi ha scritto la guida",
    "nome": "Guido Contesini",
    "ruolo": "Consulente immobiliare · Lago di Garda",
    "luogo": "Moniga del Garda (BS)",
    "paragrafi": [
      "«Sono nato in un piccolo paesino in provincia di Mantova, ma oggi mi sento ormai monighese, perché la mia casa è a Moniga del Garda. Qui ho costruito la mia vita e il mio lavoro, che amo profondamente.»",
      "«Nel corso della mia esperienza ho incontrato molti proprietari che hanno sottovalutato la complessità della vendita. Questa guida raccoglie le informazioni che ritengo davvero utili per affrontarla in modo più consapevole: se ti farà evitare anche solo uno degli errori più comuni, avrà raggiunto il suo obiettivo.»"
    ]
  },
  {
    "id": "acquista",
    "tipo": "prezzo",
    "titolo": "Una vendita buona e giusta",
    "sottotitolo": "La guida completa in 7 tappe, da leggere subito nella tua area riservata.",
    "garanzie": [
      "Pagamento sicuro con Stripe",
      "Accesso immediato dopo il pagamento",
      "Ricevuta via email",
      "Da smartphone, tablet e computer"
    ]
  },
  {
    "id": "domande",
    "tipo": "faq",
    "titolo": "Domande frequenti",
    "domande": [
      {
        "domanda": "Che cos'è esattamente la guida?",
        "risposta": "È una guida digitale di 18 pagine, «Una vendita buona e giusta», che ti accompagna nelle 7 tappe della vendita di una casa da privato: controlli, valutazione, pubblicità, visite, trattativa, rogito, imposte e costi. Con esempi pratici, tabelle e punti di attenzione."
      },
      {
        "domanda": "Come la leggo dopo l'acquisto?",
        "risposta": "Online, nella tua area riservata, da smartphone, tablet o computer. L'accesso è personale e legato al tuo account: entri con la tua email, senza password."
      },
      {
        "domanda": "Quando posso iniziare a leggerla?",
        "risposta": "Subito: appena il pagamento è confermato la guida si sblocca automaticamente nella tua area riservata."
      },
      {
        "domanda": "Il pagamento è sicuro?",
        "risposta": "Sì. Il pagamento avviene sulla pagina sicura di Stripe, uno dei principali servizi di pagamento online: i dati della carta non passano da noi. Ricevi la ricevuta via email."
      },
      {
        "domanda": "Posso scaricare il PDF?",
        "risposta": "La guida si legge online nella tua area riservata e non si scarica: così trovi sempre la versione più aggiornata."
      },
      {
        "domanda": "La guida sostituisce un professionista?",
        "risposta": "No. Come una guida medica non sostituisce il parere di un medico, questa guida non sostituisce il lavoro di un professionista: ti dà strumenti e punti di attenzione per fare scelte più consapevoli e capire quando serve un notaio, un tecnico o un avvocato."
      },
      {
        "domanda": "Ho un problema con l'acquisto: chi contatto?",
        "risposta": "Scrivici a contesiniconsulenze@gmail.com: ti rispondiamo il prima possibile."
      }
    ]
  },
  {
    "id": "accesso",
    "tipo": "invito",
    "titolo": "Hai già acquistato la guida?",
    "testo": "Entra nella tua area riservata con la tua email: ti mandiamo un link di accesso, senza password.",
    "azione": "accedi"
  }
]
  $blocchi$::jsonb
)
on conflict (slug) do nothing;
