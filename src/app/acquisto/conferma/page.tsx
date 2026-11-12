import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckIcon, ClockIcon, LoaderCircleIcon, MailIcon, TriangleAlertIcon } from "lucide-react";

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
 * quando non si entra subito (vedi `/acquisto/entra`): account già esistente,
 * pagamento in elaborazione o verifica non riuscita. Con un account esistente
 * la guida è già sbloccata e si entra dal link inviato via email.
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
          // Link HTML classico (niente prefetch): il link di accesso vale una volta sola.
          <Button
            size="lg"
            render={<a href={`/acquisto/entra?session_id=${encodeURIComponent(sessionId as string)}`} />}
            nativeButton={false}
          >
            Entra nella tua area
          </Button>
        ) : undefined
      }
    >
      <p>
        Grazie! <span className="font-medium text-foreground">{scheda.titoloCompleto}</span> è già
        sbloccata sull&apos;account{" "}
        <span className="font-medium text-foreground">{verifica.email}</span>.
      </p>
      {verifica.accessoImmediato ? (
        <p className="text-sm">Ti abbiamo inviato anche un&apos;email con il link per entrare.</p>
      ) : (
        <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-left text-sm">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <MailIcon className="size-4 shrink-0" aria-hidden />
            Controlla la tua email
          </p>
          <p>
            Ti abbiamo inviato un link per entrare nella tua area: aprilo da questo dispositivo e
            trovi la guida pronta nella dashboard. Se non lo trovi, guarda nello spam oppure{" "}
            <Link href={PERCORSO_ACCESSO} className="font-medium text-foreground underline underline-offset-4">
              richiedine uno nuovo
            </Link>
            .
          </p>
        </div>
      )}
    </EsitoAcquisto>
  );
}
