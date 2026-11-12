import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckIcon, ClockIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-react";

import { EsitoAcquisto } from "@/components/acquisto/esito-acquisto";
import { Button } from "@/components/ui/button";
import { verificaSessioneOspite, type EsitoSessioneOspite } from "@/lib/acquisti";
import { PERCORSO_ACCESSO } from "@/lib/auth/percorsi";
import { EMAIL_ASSISTENZA, prodotti } from "@/lib/prodotti";

export const metadata: Metadata = {
  title: "Acquisto completato",
  robots: { index: false, follow: false },
};

/**
 * Ritorno da Stripe Checkout per chi ha acquistato senza account
 * (`?session_id=cs_…`). Verifica il pagamento con Stripe, registra l'acquisto
 * (account trovato o creato dall'email) e, se l'account è nuovo, permette di
 * entrare subito; in ogni caso arriva anche un'email con il link di accesso.
 */
export default function PaginaConfermaOspite({ searchParams }: PageProps<"/acquisto/conferma">) {
  return (
    <Suspense
      fallback={
        <EsitoAcquisto icona={LoaderCircleIcon} tono="attesa" titolo="Stiamo confermando il pagamento" animaIcona>
          <p>Un momento…</p>
        </EsitoAcquisto>
      }
    >
      <Esito searchParams={searchParams} />
    </Suspense>
  );
}

const Assistenza = () => (
  <p className="text-sm">
    Per qualsiasi problema scrivici a{" "}
    <a
      href={`mailto:${EMAIL_ASSISTENZA}`}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {EMAIL_ASSISTENZA}
    </a>
    .
  </p>
);

async function Esito({ searchParams }: Pick<PageProps<"/acquisto/conferma">, "searchParams">) {
  const { session_id: sessionId } = await searchParams;
  const scheda = prodotti.guida;

  let verifica: EsitoSessioneOspite = { esito: "non-verificata" };
  if (typeof sessionId === "string") {
    try {
      verifica = await verificaSessioneOspite(sessionId);
    } catch (errore) {
      console.error("Conferma acquisto senza account: verifica non riuscita", errore);
    }
  }

  if (verifica.esito === "in-elaborazione") {
    return (
      <EsitoAcquisto
        icona={ClockIcon}
        tono="neutro"
        titolo="Pagamento in elaborazione"
        azionePrincipale={{ etichetta: "Torna alla pagina iniziale", href: "/" }}
      >
        <p>
          Abbiamo ricevuto il tuo ordine. Con il metodo di pagamento scelto la conferma può
          richiedere qualche giorno: appena arriva attiviamo {scheda.nome.toLowerCase()}
          {verifica.email ? ` e scriviamo a ${verifica.email}` : ""} con il link per entrare.
        </p>
        <Assistenza />
      </EsitoAcquisto>
    );
  }

  if (verifica.esito === "non-verificata") {
    return (
      <EsitoAcquisto
        icona={TriangleAlertIcon}
        tono="neutro"
        titolo="Non riusciamo a verificare l'acquisto"
        azionePrincipale={{ etichetta: "Accedi", href: PERCORSO_ACCESSO }}
        azioneSecondaria={{ etichetta: "Pagina iniziale", href: "/" }}
      >
        <p>
          Se hai appena pagato, controlla la tua email: ti abbiamo inviato il link per entrare.
          Puoi anche accedere con l&apos;email usata per l&apos;acquisto.
        </p>
        <Assistenza />
      </EsitoAcquisto>
    );
  }

  return (
    <EsitoAcquisto
      icona={CheckIcon}
      tono="successo"
      titolo="Acquisto completato!"
      pulsantePrincipale={
        verifica.accessoImmediato ? (
          // Modulo HTML classico: il browser segue davvero il redirect al link di accesso.
          <form method="post" action="/acquisto/entra">
            <input type="hidden" name="session_id" value={sessionId as string} />
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Entra e leggi la guida
            </Button>
          </form>
        ) : (
          <Button size="lg" render={<Link href={PERCORSO_ACCESSO} />} nativeButton={false}>
            Accedi
          </Button>
        )
      }
    >
      <p>
        Grazie! <span className="font-medium text-foreground">{scheda.titoloCompleto}</span> è
        collegata all&apos;account{" "}
        <span className="font-medium text-foreground">{verifica.email}</span>.
      </p>
      <p className="text-sm">
        {verifica.accessoImmediato
          ? "Ti abbiamo inviato anche un'email con il link per entrare: le volte successive accedi con questa email."
          : "Ti abbiamo inviato un'email con il link per entrare. Oppure accedi con questa email: ti mandiamo un nuovo link."}
      </p>
    </EsitoAcquisto>
  );
}
