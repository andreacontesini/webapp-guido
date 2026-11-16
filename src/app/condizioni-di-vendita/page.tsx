import type { Metadata } from "next";
import Link from "next/link";

import { DatiVenditore, PaginaLegale, Sezione } from "@/components/legale/pagina-legale";
import { venditore } from "@/lib/legale/venditore";
import { formattaPrezzo, prodotti } from "@/lib/prodotti";

export const metadata: Metadata = {
  title: "Condizioni di vendita",
  description: `Condizioni generali di vendita dei contenuti digitali di ${venditore.nome}.`,
  alternates: { canonical: "/condizioni-di-vendita" },
};

/**
 * Condizioni generali di vendita dei contenuti digitali (acquisti una tantum,
 * nessun abbonamento). Diritto di recesso: per ora resta quello ordinario di
 * 14 giorni; quando il checkout avrà la casella di rinuncia (art. 59, lett. o,
 * Codice del consumo) la sezione 8 andrà aggiornata.
 */
export default function PaginaCondizioni() {
  const guida = prodotti.guida;
  return (
    <PaginaLegale
      titolo="Condizioni di vendita"
      introduzione="Le regole che valgono quando acquisti un contenuto digitale su questo sito: cosa ricevi, come paghi, come accedi e quali sono i tuoi diritti."
    >
      <Sezione id="venditore" titolo="1. Chi vende">
        <p>I contenuti sono venduti da:</p>
        <DatiVenditore />
        <p>
          Per qualsiasi domanda sull&apos;acquisto puoi scrivere a{" "}
          <a href={`mailto:${venditore.email}`}>{venditore.email}</a>: rispondiamo di norma entro due giorni lavorativi.
        </p>
      </Sezione>

      <Sezione id="ambito" titolo="2. A cosa si applicano queste condizioni">
        <p>
          Queste condizioni regolano la vendita a distanza, tramite questo sito, di <strong>contenuti digitali</strong> (per
          esempio la guida «{guida.titoloCompleto}»). Valgono per ogni acquisto e si intendono accettate nel momento in cui
          completi il pagamento. Il testo in vigore è sempre quello pubblicato su questa pagina al momento dell&apos;ordine.
        </p>
        <p>
          Se acquisti come consumatore (per scopi estranei alla tua attività professionale) ti si applicano anche le tutele
          del Codice del consumo (D.Lgs. 206/2005), che queste condizioni non limitano in alcun modo.
        </p>
      </Sezione>

      <Sezione id="prodotti" titolo="3. Cosa acquisti">
        <ul>
          <li>
            <strong>Solo contenuti digitali</strong>: nessun bene fisico viene spedito.
          </li>
          <li>
            <strong>Acquisto una tantum</strong>: paghi una sola volta. Non ci sono abbonamenti, rinnovi automatici né
            addebiti successivi.
          </li>
          <li>
            Il contenuto si consulta nella tua <strong>area riservata</strong>, raggiungibile dal sito con il tuo account
            personale, senza limiti di tempo finché il servizio resta attivo.
          </li>
          <li>
            Le caratteristiche principali di ogni contenuto (argomenti, formato, numero di pagine) sono descritte nella
            relativa pagina di presentazione prima dell&apos;acquisto.
          </li>
        </ul>
        <p>
          I contenuti hanno scopo informativo e divulgativo: offrono un metodo e indicazioni generali per vendere casa da
          privato, ma non sostituiscono la consulenza personalizzata di un notaio, avvocato, tecnico o commercialista sul
          tuo caso specifico.
        </p>
      </Sezione>

      <Sezione id="prezzi" titolo="4. Prezzi">
        <p>
          I prezzi sono in euro e indicati nella pagina di presentazione e nella pagina di pagamento. Il prezzo mostrato al
          momento del pagamento è il <strong>prezzo finale</strong> che paghi, comprensivo delle imposte eventualmente
          dovute: non ci sono costi di consegna né altri costi aggiuntivi.
          {guida.prezzo !== null && <> Oggi la guida costa {formattaPrezzo(guida.prezzo)}.</>}
        </p>
        <p>
          Possiamo cambiare i prezzi in qualsiasi momento; le modifiche non riguardano gli acquisti già completati.
        </p>
      </Sezione>

      <Sezione id="ordine" titolo="5. Come si conclude l'acquisto">
        <ul>
          <li>Premi «Acquista» e vieni portato sulla pagina di pagamento sicura di Stripe.</li>
          <li>Inserisci la tua email, i tuoi dati e il metodo di pagamento, e controlli il riepilogo dell&apos;ordine.</li>
          <li>
            Il contratto si conclude quando il pagamento viene confermato. Ricevi via email la ricevuta del pagamento e la
            conferma con le istruzioni per accedere.
          </li>
        </ul>
        <p>
          Se all&apos;email inserita corrisponde già un account, il contenuto viene aggiunto a quell&apos;account; altrimenti
          ne viene creato uno nuovo, intestato a quell&apos;email. Controlla quindi di scriverla correttamente.
        </p>
      </Sezione>

      <Sezione id="pagamento" titolo="6. Pagamento">
        <p>
          I pagamenti sono gestiti da <strong>Stripe</strong>, fornitore di servizi di pagamento autorizzato. Puoi pagare
          con i metodi proposti nella pagina di pagamento (per esempio carta di credito o di debito). I dati della carta
          vengono inseriti direttamente su Stripe: noi non li vediamo e non li conserviamo.
        </p>
        <p>
          Alcuni metodi di pagamento possono richiedere qualche giorno per la conferma: in quel caso l&apos;accesso viene
          attivato appena il pagamento risulta completato, e ti avvisiamo via email.
        </p>
        <p>
          Il documento fiscale relativo all&apos;acquisto viene emesso secondo la normativa vigente. Se ti serve intestato
          a un&apos;azienda o a una partita IVA, scrivici a <a href={`mailto:${venditore.email}`}>{venditore.email}</a>{" "}
          indicando i dati di fatturazione, possibilmente entro pochi giorni dall&apos;acquisto.
        </p>
      </Sezione>

      <Sezione id="accesso" titolo="7. Accesso al contenuto e uso consentito">
        <p>
          L&apos;accesso viene attivato <strong>subito dopo la conferma del pagamento</strong>: entri nell&apos;area
          riservata con il link di accesso che ricevi via email, senza password.
        </p>
        <p>Con l&apos;acquisto ottieni una licenza d&apos;uso personale e non esclusiva. In particolare:</p>
        <ul>
          <li>il contenuto è per te: non puoi rivenderlo, copiarlo, distribuirlo o renderlo disponibile ad altri;</li>
          <li>
            l&apos;account è personale: per proteggere i contenuti, un nuovo accesso da un altro dispositivo chiude la
            sessione precedente;
          </li>
          <li>
            le pagine riportano una filigrana con il tuo indirizzo email, a tutela dei contenuti contro la diffusione non
            autorizzata.
          </li>
        </ul>
        <p>
          Testi, immagini, video e grafica sono protetti dal diritto d&apos;autore e restano di proprietà di{" "}
          {venditore.nome}. In caso di uso non consentito possiamo sospendere l&apos;account, dopo averti avvisato quando
          possibile.
        </p>
      </Sezione>

      <Sezione id="recesso" titolo="8. Diritto di recesso">
        <p>
          Se sei un consumatore puoi recedere dall&apos;acquisto <strong>entro 14 giorni</strong> dalla conclusione del
          contratto, senza dover dare spiegazioni (artt. 52 e seguenti del Codice del consumo).
        </p>
        <p>
          Per farlo basta inviare una comunicazione chiara a <a href={`mailto:${venditore.email}`}>{venditore.email}</a>{" "}
          indicando l&apos;email usata per l&apos;acquisto. Puoi anche usare il modulo tipo di recesso (allegato I, parte
          B, del Codice del consumo), ma non è obbligatorio.
        </p>
        <p>
          Ti rimborsiamo l&apos;intero importo <strong>entro 14 giorni</strong> dalla ricezione della tua comunicazione,
          con lo stesso metodo di pagamento che hai usato, senza costi. Con il rimborso l&apos;accesso al contenuto viene
          disattivato.
        </p>
      </Sezione>

      <Sezione id="conformita" titolo="9. Garanzia e problemi di accesso">
        <p>
          Il contenuto deve corrispondere a quanto descritto e funzionare come previsto (garanzia legale di conformità per i
          contenuti digitali, artt. 135-octies e seguenti del Codice del consumo). Se qualcosa non va, per esempio non
          riesci ad accedere o il file non si apre, scrivici: risolveremo il problema o, se non è possibile, avrai diritto
          a una riduzione del prezzo o al rimborso.
        </p>
        <p>
          Il servizio può essere sospeso per brevi periodi per manutenzione o per cause che non dipendono da noi (per
          esempio problemi dei fornitori di rete o di hosting). Facciamo il possibile per ridurre al minimo queste
          interruzioni.
        </p>
      </Sezione>

      <Sezione id="responsabilita" titolo="10. Responsabilità">
        <p>
          Curiamo i contenuti con attenzione e li aggiorniamo nel tempo, ma norme, prassi e mercato cambiano: le
          informazioni vanno verificate sul tuo caso concreto. Non rispondiamo delle decisioni prese sulla sola base dei
          contenuti, salvo nei casi di dolo o colpa grave e negli altri casi in cui la legge non consente di limitare la
          responsabilità.
        </p>
      </Sezione>

      <Sezione id="dati" titolo="11. Dati personali">
        <p>
          I dati che ci fornisci per l&apos;acquisto sono trattati come descritto nell&apos;
          <Link href="/privacy">informativa privacy</Link>.
        </p>
      </Sezione>

      <Sezione id="reclami" titolo="12. Assistenza, reclami e controversie">
        <p>
          Per assistenza o reclami scrivi a <a href={`mailto:${venditore.email}`}>{venditore.email}</a>: ti rispondiamo
          appena possibile e comunque entro 10 giorni lavorativi.
        </p>
        <p>
          Il contratto è regolato dalla legge italiana. Se sei un consumatore, per le controversie è competente il giudice
          del luogo in cui risiedi o hai il domicilio, e restano salve le norme più favorevoli del Paese in cui vivi. Puoi
          anche ricorrere a un organismo di risoluzione alternativa delle controversie (ADR) previsto dal Codice del
          consumo.
        </p>
      </Sezione>

      <Sezione id="modifiche" titolo="13. Modifiche alle condizioni">
        <p>
          Possiamo aggiornare queste condizioni, per esempio per nuove norme o nuovi contenuti in vendita. Le modifiche
          valgono per gli acquisti successivi alla pubblicazione; la data dell&apos;ultimo aggiornamento è indicata in alto.
        </p>
      </Sezione>
    </PaginaLegale>
  );
}
