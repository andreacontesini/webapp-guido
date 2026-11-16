import type { Metadata } from "next";
import Link from "next/link";

import { PaginaLegale, Sezione } from "@/components/legale/pagina-legale";
import { venditore } from "@/lib/legale/venditore";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "Quali cookie e strumenti simili usano le pagine di presentazione: solo tecnici, nessuna profilazione.",
  alternates: { canonical: "/cookie" },
};

/**
 * Cookie policy delle pagine pubbliche. Le landing non usano cookie di
 * statistica o profilazione (conteggio visite anonimo, senza cookie), quindi
 * non serve il banner: se si aggiungono strumenti di analisi o pixel
 * pubblicitari questa pagina va rivista e serve un banner per il consenso.
 */
export default function PaginaCookie() {
  return (
    <PaginaLegale
      titolo="Cookie policy"
      introduzione="Queste pagine usano solo strumenti tecnici, necessari a farle funzionare. Nessun cookie di profilazione o pubblicità, nessun tracciamento."
    >
      <Sezione id="cosa-sono" titolo="1. Cosa sono i cookie">
        <p>
          I cookie sono piccoli file di testo che un sito salva nel browser per ricordare informazioni tra una pagina e
          l&apos;altra. Strumenti simili sono la memoria locale del browser (local storage). La legge distingue tra
          strumenti <strong>tecnici</strong>, che servono al funzionamento del sito e non richiedono il consenso, e
          strumenti di <strong>profilazione o statistica</strong> non anonima, che invece lo richiedono.
        </p>
      </Sezione>

      <Sezione id="nostri" titolo="2. Cosa usiamo noi">
        <ul>
          <li>
            <strong>Preferenza del tema</strong> (chiaro o scuro): salvata nella memoria locale del browser solo se la
            cambi. Tecnico.
          </li>
          <li>
            <strong>Sessione dell&apos;area riservata</strong>: se accedi al tuo account, alcuni cookie tecnici ti
            mantengono collegato in modo sicuro. Se non accedi, non vengono creati.
          </li>
          <li>
            <strong>Conteggio delle visite</strong>: le visite alle pagine di presentazione vengono contate{" "}
            <strong>senza cookie</strong> e senza dati che ti identificano.
          </li>
        </ul>
        <p>Non usiamo strumenti di analisi di terze parti, pixel pubblicitari o cookie di profilazione.</p>
      </Sezione>

      <Sezione id="terze-parti" titolo="3. Servizi di terze parti">
        <ul>
          <li>
            <strong>Pagamento (Stripe).</strong> Quando premi «Acquista» vieni portato sulla pagina di pagamento di Stripe,
            che usa propri cookie tecnici e antifrode secondo la{" "}
            <a href="https://stripe.com/it/cookie-settings" target="_blank" rel="noreferrer">
              cookie policy di Stripe
            </a>
            .
          </li>
          <li>
            <strong>Video incorporati</strong> (Bunny.net, YouTube, Vimeo). Il lettore del fornitore si carica solo quando
            premi «play» oppure, per i video ad avvio automatico, quando il video compare sullo schermo. Usiamo le modalità
            più rispettose della privacy offerte dai fornitori: YouTube in modalità «privacy avanzata» (dominio
            youtube-nocookie.com) e Vimeo con l&apos;opzione «do not track». Da quel momento il fornitore riceve il tuo
            indirizzo IP e può usare strumenti tecnici propri per riprodurre il video. Per i video YouTube anche
            l&apos;immagine di copertina arriva dai server di Google.
          </li>
        </ul>
      </Sezione>

      <Sezione id="consenso" titolo="4. Perché non ti chiediamo il consenso">
        <p>
          Gli strumenti che usiamo sono solo tecnici e le statistiche sono anonime: per questo, come previsto dalle linee
          guida del Garante per la protezione dei dati personali, non serve un banner per il consenso.
        </p>
      </Sezione>

      <Sezione id="gestione" titolo="5. Come gestirli">
        <p>
          Puoi cancellare o bloccare cookie e memoria locale dalle impostazioni del tuo browser. Se blocchi i cookie
          tecnici l&apos;accesso all&apos;area riservata non funzionerà, mentre le pagine di presentazione restano
          consultabili.
        </p>
        <p>
          Per sapere come trattiamo i dati personali leggi l&apos;<Link href="/privacy">informativa privacy</Link>. Per
          domande scrivi a <a href={`mailto:${venditore.email}`}>{venditore.email}</a>.
        </p>
      </Sezione>
    </PaginaLegale>
  );
}
