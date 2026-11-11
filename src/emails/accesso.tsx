import { LayoutEmail, PulsanteEmail, TestoEmail, TitoloEmail } from "./componenti/layout-email";

/**
 * Link di accesso (Magic Link). Modello per Supabase Auth: usato sia per
 * "Magic Link" sia per "Confirm signup" (primo accesso di un nuovo indirizzo).
 * Generato in `supabase/templates/` con `npm run email:supabase`.
 */
export type PropsAccesso = {
  urlAccesso: string;
  baseUrl?: string;
  /** Primo accesso: testo di benvenuto al posto di "bentornato". */
  nuovoAccount?: boolean;
};

export default function EmailAccesso({ urlAccesso, baseUrl, nuovoAccount = false }: PropsAccesso) {
  return (
    <LayoutEmail
      anteprima="Il tuo link personale per entrare nell'area riservata."
      baseUrl={baseUrl}
    >
      <TitoloEmail>{nuovoAccount ? "Benvenuto! Conferma il tuo indirizzo" : "Accedi alla tua area riservata"}</TitoloEmail>
      <TestoEmail>
        {nuovoAccount
          ? "Grazie per esserti registrato a Vendere Casa da Privato. Clicca sul pulsante per confermare la tua email ed entrare nell'area riservata."
          : "Ciao, clicca sul pulsante qui sotto per entrare nella tua area riservata di Vendere Casa da Privato."}
      </TestoEmail>
      <PulsanteEmail href={urlAccesso}>{nuovoAccount ? "Conferma ed entra" : "Accedi ora"}</PulsanteEmail>
      <TestoEmail tenue>
        Il link vale per un solo accesso e scade dopo un&apos;ora. Se non hai richiesto tu questa email, puoi
        ignorarla: nessuno potrà entrare senza il link.
      </TestoEmail>
    </LayoutEmail>
  );
}

EmailAccesso.PreviewProps = {
  urlAccesso: "https://app.guidocontesini.it/auth/conferma?token_hash=esempio&type=email&next=/dashboard",
} satisfies PropsAccesso;
