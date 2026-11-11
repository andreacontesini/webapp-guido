import { LayoutEmail, PulsanteEmail, TestoEmail, TitoloEmail } from "./componenti/layout-email";

/**
 * Conferma del cambio di indirizzo email. Modello per Supabase Auth
 * ("Change Email Address"), generato con `npm run email:supabase`.
 */
export type PropsCambioEmail = {
  urlConferma: string;
  vecchiaEmail: string;
  nuovaEmail: string;
  baseUrl?: string;
};

export default function EmailCambioEmail({ urlConferma, vecchiaEmail, nuovaEmail, baseUrl }: PropsCambioEmail) {
  return (
    <LayoutEmail anteprima="Conferma il nuovo indirizzo email del tuo account." baseUrl={baseUrl}>
      <TitoloEmail>Conferma il nuovo indirizzo email</TitoloEmail>
      <TestoEmail>
        Hai chiesto di cambiare l&apos;email del tuo account da <strong>{vecchiaEmail}</strong> a{" "}
        <strong>{nuovaEmail}</strong>. Clicca sul pulsante per confermare.
      </TestoEmail>
      <PulsanteEmail href={urlConferma}>Conferma il cambio</PulsanteEmail>
      <TestoEmail tenue>
        Se non hai richiesto tu questa modifica, ignora l&apos;email: il tuo indirizzo resterà invariato.
      </TestoEmail>
    </LayoutEmail>
  );
}

EmailCambioEmail.PreviewProps = {
  urlConferma: "https://app.guidocontesini.it/auth/conferma?token_hash=esempio&type=email_change&next=/dashboard",
  vecchiaEmail: "mario.rossi@esempio.it",
  nuovaEmail: "mario@nuovo.it",
} satisfies PropsCambioEmail;
