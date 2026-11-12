import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CheckIcon, ClockIcon, LoaderCircleIcon } from "lucide-react";

import { AttesaSblocco } from "@/app/dashboard/acquisto/conferma/attesa-sblocco";
import { EsitoAcquisto } from "@/components/acquisto/esito-acquisto";
import { verificaSessioneCheckout, type EsitoSessione } from "@/lib/acquisti";
import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { leggiStatoGuida } from "@/lib/guida";
import { EMAIL_ASSISTENZA, isCodiceProdotto, prodotti, type CodiceProdotto } from "@/lib/prodotti";

export const metadata: Metadata = {
  title: "Acquisto completato",
  robots: { index: false, follow: false },
};

/**
 * Ritorno da Stripe Checkout dopo un pagamento riuscito
 * (`?prodotto=guida|videocorso&session_id=cs_…`).
 * Con `session_id` verifica il pagamento con Stripe e, se confermato, sblocca
 * subito il contenuto. Senza (o se la verifica non riesce) mostra la conferma
 * quando il contenuto risulta sbloccato dal webhook, altrimenti attende.
 */
export default function PaginaConferma({ searchParams }: PageProps<"/dashboard/acquisto/conferma">) {
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

/** True se l'utente ha già accesso al prodotto acquistato. */
async function isSbloccato(codice: CodiceProdotto) {
  if (codice === "guida") return (await leggiStatoGuida()).stato !== "non-abilitata";
  // Il permesso per il videocorso arriverà con la Fase 13 (prodotto videocorso in purchases).
  return false;
}

async function Esito({ searchParams }: Pick<PageProps<"/dashboard/acquisto/conferma">, "searchParams">) {
  const { prodotto, session_id: sessionId } = await searchParams;
  if (!isCodiceProdotto(prodotto)) redirect("/dashboard");

  const scheda = prodotti[prodotto];
  let esito: EsitoSessione = "non-verificata";
  if (typeof sessionId === "string") {
    const profilo = await leggiProfiloCorrente();
    try {
      esito = await verificaSessioneCheckout(sessionId, profilo.id);
    } catch (errore) {
      // Lo sblocco arriverà comunque dal webhook: si ripiega sull'attesa.
      console.error("Conferma acquisto: verifica della sessione non riuscita", errore);
    }
  }

  if (esito === "in-elaborazione") {
    return (
      <EsitoAcquisto
        icona={ClockIcon}
        tono="neutro"
        titolo="Pagamento in elaborazione"
        azionePrincipale={{ etichetta: "Torna alla tua area", href: "/dashboard" }}
      >
        <p>
          Abbiamo ricevuto il tuo ordine. Con il metodo di pagamento scelto la conferma può
          richiedere qualche giorno: appena arriva attiviamo {scheda.nome.toLowerCase()} e ti
          avvisiamo via email.
        </p>
        <p className="text-sm">
          Per qualsiasi dubbio scrivici a{" "}
          <a
            href={`mailto:${EMAIL_ASSISTENZA}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {EMAIL_ASSISTENZA}
          </a>
          .
        </p>
      </EsitoAcquisto>
    );
  }

  // Il profilo letto all'inizio della richiesta non vede lo sblocco appena
  // fatto: se Stripe ha confermato il pagamento non serve ricontrollarlo.
  if (esito !== "pagato" && !(await isSbloccato(prodotto))) {
    return <AttesaSblocco nomeProdotto={scheda.nome} delNome={scheda.delNome} />;
  }

  return (
    <EsitoAcquisto
      icona={CheckIcon}
      tono="successo"
      titolo="Acquisto completato!"
      azionePrincipale={{ etichetta: scheda.etichettaApri, href: scheda.href }}
      azioneSecondaria={{ etichetta: "Torna alla tua area", href: "/dashboard" }}
    >
      <p>
        Grazie! <span className="font-medium text-foreground">{scheda.titoloCompleto}</span> è
        ora disponibile nella tua area, da qualsiasi dispositivo.
      </p>
      <p className="text-sm">Ti abbiamo inviato la ricevuta via email.</p>
    </EsitoAcquisto>
  );
}
