"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, MailIcon } from "lucide-react";

import { EsitoAcquisto } from "@/components/acquisto/esito-acquisto";
import { EMAIL_ASSISTENZA } from "@/lib/prodotti";

const INTERVALLO_MS = 2500;
const TENTATIVI_MAX = 12; // circa 30 secondi

/**
 * Il pagamento è andato a buon fine ma lo sblocco arriva dal webhook di
 * Stripe, che può impiegare qualche secondo: ricarichiamo i dati finché il
 * contenuto risulta sbloccato (la pagina server mostra allora la conferma).
 */
export function AttesaSblocco({ nomeProdotto, delNome }: { nomeProdotto: string; delNome: string }) {
  const router = useRouter();
  const [tentativi, setTentativi] = useState(0);
  const scaduto = tentativi >= TENTATIVI_MAX;

  useEffect(() => {
    if (scaduto) return;
    const timer = setTimeout(() => {
      router.refresh();
      setTentativi((t) => t + 1);
    }, INTERVALLO_MS);
    return () => clearTimeout(timer);
  }, [tentativi, scaduto, router]);

  if (scaduto) {
    return (
      <EsitoAcquisto
        icona={MailIcon}
        tono="neutro"
        titolo="Ci stiamo mettendo più del previsto"
        azionePrincipale={{ etichetta: "Torna alla tua area", href: "/dashboard" }}
      >
        <p>
          Il pagamento è stato ricevuto, ma l&apos;attivazione {delNome} sta
          richiedendo qualche minuto in più. Ti arriverà anche la ricevuta via email.
        </p>
        <p>
          Se tra qualche minuto non risulta ancora attivo, scrivici a{" "}
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

  return (
    <EsitoAcquisto icona={LoaderCircleIcon} tono="attesa" titolo="Stiamo confermando il pagamento" animaIcona>
      <p>
        Grazie! Stiamo attivando {nomeProdotto.toLowerCase()} sul tuo account: ci vuole solo
        qualche secondo.
      </p>
      <p className="text-sm">Non chiudere questa pagina.</p>
    </EsitoAcquisto>
  );
}
