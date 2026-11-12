import { LayoutEmail, TestoEmail, TitoloEmail } from "./componenti/layout-email";

/** Conferma inviata dall'app (Resend) quando il cliente elimina il proprio account. */
export type PropsAccountEliminato = { nome?: string | null };

export default function EmailAccountEliminato({ nome }: PropsAccountEliminato) {
  return (
    <LayoutEmail anteprima="Il tuo account su Vendere Casa da Privato è stato eliminato.">
      <TitoloEmail>Account eliminato{nome ? `, ${nome}` : ""}</TitoloEmail>
      <TestoEmail>
        Come richiesto, abbiamo eliminato il tuo account su Vendere Casa da Privato insieme ai dati
        del profilo e della tua casa.
      </TestoEmail>
      <TestoEmail>
        Conserviamo solo i dati degli acquisti che la legge fiscale ci chiede di tenere. Se hai
        acquistato la guida, l&apos;accesso non è più disponibile.
      </TestoEmail>
      <TestoEmail tenue>
        Non sei stato tu? Scrivici subito a contesiniconsulenze@gmail.com.
      </TestoEmail>
    </LayoutEmail>
  );
}

EmailAccountEliminato.PreviewProps = { nome: "Mario" } satisfies PropsAccountEliminato;
