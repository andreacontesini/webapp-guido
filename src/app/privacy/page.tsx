import type { Metadata } from "next";
import Link from "next/link";

import { DatiVenditore, PaginaLegale, Sezione } from "@/components/legale/pagina-legale";
import { venditore } from "@/lib/legale/venditore";

export const metadata: Metadata = {
  title: "Informativa privacy",
  description: `Come ${venditore.nome} tratta i dati personali di chi visita le pagine di presentazione e acquista i contenuti.`,
  alternates: { canonical: "/privacy" },
};

/**
 * Informativa privacy (art. 13 GDPR) per le pagine pubbliche: navigazione
 * delle landing, conteggio anonimo delle visite, acquisto e contatti.
 * Fornitori elencati: aggiornare la sezione 5 se se ne aggiungono altri.
 */
export default function PaginaPrivacy() {
  return (
    <PaginaLegale
      titolo="Informativa privacy"
      introduzione="Quali dati raccogliamo quando visiti queste pagine o acquisti un contenuto, perché li usiamo, per quanto tempo e quali sono i tuoi diritti."
    >
      <Sezione id="titolare" titolo="1. Titolare del trattamento">
        <p>Il titolare del trattamento dei dati è:</p>
        <DatiVenditore />
        <p>
          Per qualsiasi richiesta sui tuoi dati scrivi a <a href={`mailto:${venditore.email}`}>{venditore.email}</a>.
        </p>
      </Sezione>

      <Sezione id="dati" titolo="2. Quali dati trattiamo">
        <ul>
          <li>
            <strong>Dati di navigazione.</strong> Come ogni sito, i server registrano automaticamente alcuni dati tecnici
            (indirizzo IP, tipo di browser, pagina richiesta, data e ora) necessari a mostrare le pagine e a proteggerle da
            abusi.
          </li>
          <li>
            <strong>Statistiche delle visite.</strong> Contiamo le visite alle pagine di presentazione e i pagamenti avviati
            in forma <strong>anonima</strong>: registriamo solo la pagina, il tipo di evento e la data, senza cookie, senza
            indirizzo IP e senza alcun dato che permetta di identificarti.
          </li>
          <li>
            <strong>Dati dell&apos;acquisto.</strong> Quando acquisti: email, nome e cognome, dati di fatturazione
            eventualmente indicati, prodotto, importo, data e stato del pagamento. I dati della carta o del conto vengono
            inseriti direttamente su Stripe e non arrivano a noi.
          </li>
          <li>
            <strong>Dati dell&apos;account.</strong> L&apos;acquisto crea (o aggiorna) il tuo account personale per
            accedere al contenuto, intestato all&apos;email usata per pagare.
          </li>
          <li>
            <strong>Richieste dai moduli di contatto.</strong> Quando compili un modulo di contatto su queste pagine
            (per esempio per prenotare una consulenza): i dati che inserisci, come nome e cognome, email, telefono,
            città e messaggio, la pagina da cui scrivi, la data e il tuo consenso.
          </li>
          <li>
            <strong>Comunicazioni.</strong> I dati che ci scrivi via email quando chiedi assistenza o informazioni.
          </li>
        </ul>
      </Sezione>

      <Sezione id="finalita" titolo="3. Perché li usiamo e su quale base">
        <ul>
          <li>
            <strong>Mostrare le pagine e mantenerle sicure</strong>: legittimo interesse al funzionamento e alla sicurezza
            del sito (art. 6.1.f GDPR).
          </li>
          <li>
            <strong>Capire quali pagine funzionano meglio</strong>, con statistiche anonime: legittimo interesse; non
            trattandosi di dati personali, non serve il consenso.
          </li>
          <li>
            <strong>Gestire l&apos;acquisto, attivare l&apos;accesso e inviarti le email di servizio</strong> (ricevuta,
            conferma, link di accesso): esecuzione del contratto (art. 6.1.b GDPR).
          </li>
          <li>
            <strong>Adempiere agli obblighi fiscali e contabili</strong> legati alla vendita: obbligo di legge (art. 6.1.c
            GDPR).
          </li>
          <li>
            <strong>Rispondere alle tue richieste</strong> di assistenza: esecuzione del contratto o di misure
            precontrattuali richieste da te.
          </li>
          <li>
            <strong>Ricontattarti dopo che hai compilato un modulo di contatto</strong>, per rispondere alla tua
            richiesta e organizzare l&apos;eventuale consulenza: misure precontrattuali richieste da te (art. 6.1.b
            GDPR). Non usiamo questi dati per altri scopi né per inviarti pubblicità.
          </li>
        </ul>
        <p>
          Non usiamo i tuoi dati per pubblicità profilata, non li vendiamo e non prendiamo decisioni automatizzate che ti
          riguardano. Fornire i dati dell&apos;acquisto è necessario per concluderlo: senza, non possiamo venderti il
          contenuto.
        </p>
      </Sezione>

      <Sezione id="conservazione" titolo="4. Per quanto tempo li conserviamo">
        <ul>
          <li>Dati di navigazione: per il tempo previsto dai registri tecnici dei fornitori, di norma pochi giorni o settimane.</li>
          <li>Account: finché non lo elimini (puoi farlo in autonomia dall&apos;area riservata) o non ci chiedi di farlo.</li>
          <li>
            Dati degli acquisti: 10 anni, come richiesto dalla normativa fiscale. Se elimini l&apos;account, gli acquisti
            restano registrati ma non sono più collegati a te come utente.
          </li>
          <li>
            Richieste dai moduli di contatto: 24 mesi dall&apos;ultimo contatto, salvo che nel frattempo nasca un
            rapporto di consulenza (in quel caso per la durata del rapporto e gli obblighi di legge successivi). Puoi
            chiederne la cancellazione in qualsiasi momento.
          </li>
          <li>Email di assistenza: per il tempo necessario a gestire la richiesta e gli eventuali seguiti.</li>
        </ul>
      </Sezione>

      <Sezione id="destinatari" titolo="5. Chi altro tratta i dati">
        <p>
          Per far funzionare il sito ci affidiamo a fornitori che trattano i dati per nostro conto, come responsabili del
          trattamento, solo per i servizi indicati:
        </p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong>: hosting del sito.
          </li>
          <li>
            <strong>Supabase Inc.</strong>: database e autenticazione dell&apos;area riservata.
          </li>
          <li>
            <strong>Stripe</strong>: gestione dei pagamenti. Per i dati di pagamento Stripe agisce anche come titolare
            autonomo, secondo la propria informativa.
          </li>
          <li>
            <strong>Resend</strong>: invio delle email di servizio e delle notifiche interne sulle richieste ricevute.
          </li>
          <li>
            <strong>Fornitori dei video</strong> (Bunny.net, YouTube, Vimeo), solo se avvii un video incorporato nella pagina:
            vedi la <Link href="/cookie">cookie policy</Link>.
          </li>
          <li>Il commercialista, per gli adempimenti fiscali.</li>
        </ul>
        <p>
          Alcuni di questi fornitori hanno sede o server fuori dall&apos;Unione europea (in particolare negli Stati Uniti).
          In questi casi il trasferimento avviene con le garanzie previste dal GDPR: decisione di adeguatezza (EU-US Data
          Privacy Framework) o clausole contrattuali standard approvate dalla Commissione europea.
        </p>
      </Sezione>

      <Sezione id="diritti" titolo="6. I tuoi diritti">
        <p>In qualsiasi momento puoi chiedere di:</p>
        <ul>
          <li>sapere quali dati abbiamo e averne una copia (accesso e portabilità);</li>
          <li>correggerli o completarli;</li>
          <li>cancellarli, salvo quelli che dobbiamo conservare per legge;</li>
          <li>limitarne il trattamento od opporti a quello basato sul legittimo interesse.</li>
        </ul>
        <p>
          Dall&apos;area riservata puoi scaricare i tuoi dati ed eliminare l&apos;account in autonomia; per tutto il resto
          scrivi a <a href={`mailto:${venditore.email}`}>{venditore.email}</a>. Rispondiamo entro un mese. Se ritieni che
          il trattamento non sia corretto puoi presentare reclamo al{" "}
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
            Garante per la protezione dei dati personali
          </a>
          .
        </p>
      </Sezione>

      <Sezione id="minori" titolo="7. Minori">
        <p>I contenuti in vendita sono rivolti a persone maggiorenni. Non raccogliamo consapevolmente dati di minori.</p>
      </Sezione>

      <Sezione id="modifiche" titolo="8. Modifiche">
        <p>
          Possiamo aggiornare questa informativa, per esempio se cambiano i fornitori o i servizi offerti. La data
          dell&apos;ultimo aggiornamento è indicata in alto.
        </p>
      </Sezione>
    </PaginaLegale>
  );
}
