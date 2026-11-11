import { LayoutEmail, PulsanteEmail, TestoEmail, TitoloEmail } from "./componenti/layout-email";

/**
 * Inviata dall'app (Resend) quando un admin crea un account dal back office.
 * Il pulsante contiene un link di accesso personale (monouso, valido un'ora).
 */
export type PropsAccountCreato = {
  urlAccesso: string;
  nome?: string | null;
  guidaAttiva: boolean;
};

export default function EmailAccountCreato({ urlAccesso, nome, guidaAttiva }: PropsAccountCreato) {
  return (
    <LayoutEmail anteprima="Il tuo account è pronto: entra nella tua area riservata.">
      <TitoloEmail>Il tuo account è pronto{nome ? `, ${nome}` : ""}</TitoloEmail>
      <TestoEmail>
        Guido Contesini ha creato per te un account su Vendere Casa da Privato.
        {guidaAttiva
          ? " La guida «Una vendita buona e giusta» è già attiva e puoi leggerla subito."
          : ""}
      </TestoEmail>
      <PulsanteEmail href={urlAccesso}>Entra nell&apos;area riservata</PulsanteEmail>
      <TestoEmail tenue>
        Il pulsante vale per un solo accesso e scade dopo un&apos;ora. Se è scaduto, o per gli accessi
        successivi, vai su app.guidocontesini.it e inserisci la tua email: ti invieremo un nuovo link.
      </TestoEmail>
    </LayoutEmail>
  );
}

EmailAccountCreato.PreviewProps = {
  urlAccesso: "https://app.guidocontesini.it/auth/conferma?token_hash=esempio&type=email&next=/dashboard",
  nome: "Mario",
  guidaAttiva: true,
} satisfies PropsAccountCreato;
