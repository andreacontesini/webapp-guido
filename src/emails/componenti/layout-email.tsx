import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

import { EMAIL_ASSISTENZA } from "@/lib/prodotti";
import { urlApp } from "@/lib/url";

/**
 * Layout comune a tutte le email (Supabase Auth e Resend).
 * Stile dell'app: inchiostro blu notte, accento blu, raggi contenuti.
 * Colori inline (tema chiaro) + regole `prefers-color-scheme: dark` per i
 * client che le supportano (Apple Mail, Outlook per Mac/iOS). Gmail e
 * Outlook desktop applicano la propria inversione automatica: per questo
 * pulsante e logo restano leggibili anche invertiti.
 */

export const coloriEmail = {
  sfondo: "#f1f3f6",
  scheda: "#ffffff",
  testo: "#0f1e33",
  testoTenue: "#5b6676",
  bordo: "#e4e7ec",
  primario: "#2b5bd7",
  suPrimario: "#ffffff",
} as const;

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export { urlApp };

const stileTemaScuro = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    /* Body di React Email ripete lo sfondo sulla prima cella: va scurita anche quella. */
    .e-sfondo, .e-sfondo > table > tbody > tr > td { background-color: #0e1116 !important; }
    .e-scheda { background-color: #161b22 !important; border-color: #262c36 !important; }
    .e-testo { color: #e8ebf0 !important; }
    .e-tenue { color: #9aa4b2 !important; }
    .e-bordo { border-color: #262c36 !important; }
    .e-link { color: #6b95ff !important; }
  }
`;

type PropsLayout = {
  /** Testo di anteprima mostrato nell'elenco della casella di posta. */
  anteprima: string;
  /** URL base per il logo; nei modelli Supabase vale `{{ .SiteURL }}`. */
  baseUrl?: string;
  children: React.ReactNode;
};

export function LayoutEmail({ anteprima, baseUrl = urlApp(), children }: PropsLayout) {
  return (
    <Html lang="it">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{stileTemaScuro}</style>
      </Head>
      <Preview>{anteprima}</Preview>
      <Body
        lang="it"
        className="e-sfondo"
        style={{ backgroundColor: coloriEmail.sfondo, margin: 0, padding: "32px 12px", fontFamily: font }}
      >
        <Container style={{ maxWidth: "560px", margin: "0 auto" }}>
          {/* Intestazione: logo e nome dell'app */}
          <Section style={{ padding: "0 4px 20px" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "12px" }}>
                    <Img
                      src={`${baseUrl}/email/logo.png`}
                      width="40"
                      height="40"
                      alt="Vendere Casa da Privato"
                      style={{ display: "block", borderRadius: "8px" }}
                    />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Text
                      className="e-testo"
                      style={{ margin: 0, fontSize: "16px", lineHeight: "20px", fontWeight: 600, color: coloriEmail.testo }}
                    >
                      Vendere Casa da Privato
                    </Text>
                    <Text
                      className="e-tenue"
                      style={{ margin: 0, fontSize: "13px", lineHeight: "18px", color: coloriEmail.testoTenue }}
                    >
                      di Guido Contesini
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Contenuto */}
          <Section
            className="e-scheda"
            style={{
              backgroundColor: coloriEmail.scheda,
              border: `1px solid ${coloriEmail.bordo}`,
              borderRadius: "12px",
              padding: "32px 28px",
            }}
          >
            {children}
          </Section>

          {/* Piè di pagina: contatti e assistenza */}
          <Section style={{ padding: "24px 4px 0" }}>
            <Text className="e-tenue" style={stilePiede}>
              Guido Contesini — Mediatore immobiliare
            </Text>
            <Text className="e-tenue" style={stilePiede}>
              Serve aiuto? Scrivi a{" "}
              <Link href={`mailto:${EMAIL_ASSISTENZA}`} className="e-link" style={{ color: coloriEmail.primario }}>
                {EMAIL_ASSISTENZA}
              </Link>
            </Text>
            <Text className="e-tenue" style={stilePiede}>
              <Link href={baseUrl} className="e-link" style={{ color: coloriEmail.primario }}>
                {baseUrl.replace(/^https?:\/\//, "")}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const stilePiede = {
  margin: "0 0 4px",
  fontSize: "13px",
  lineHeight: "20px",
  color: coloriEmail.testoTenue,
} as const;

/** Titolo principale dell'email. */
export function TitoloEmail({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="e-testo"
      style={{ margin: "0 0 16px", fontSize: "22px", lineHeight: "30px", fontWeight: 700, color: coloriEmail.testo }}
    >
      {children}
    </Text>
  );
}

/** Paragrafo di testo. */
export function TestoEmail({ children, tenue = false }: { children: React.ReactNode; tenue?: boolean }) {
  return (
    <Text
      className={tenue ? "e-tenue" : "e-testo"}
      style={{
        margin: "0 0 16px",
        fontSize: tenue ? "14px" : "16px",
        lineHeight: tenue ? "22px" : "26px",
        color: tenue ? coloriEmail.testoTenue : coloriEmail.testo,
      }}
    >
      {children}
    </Text>
  );
}

/** Pulsante principale, ben visibile, con link di riserva in chiaro sotto. */
export function PulsanteEmail({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <>
      <Section style={{ margin: "8px 0 24px" }}>
        <Button
          href={href}
          style={{
            backgroundColor: coloriEmail.primario,
            color: coloriEmail.suPrimario,
            borderRadius: "8px",
            padding: "14px 28px",
            fontSize: "16px",
            lineHeight: "20px",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          {children}
        </Button>
      </Section>
      <Hr className="e-bordo" style={{ borderTop: `1px solid ${coloriEmail.bordo}`, margin: "0 0 16px" }} />
      <Text className="e-tenue" style={{ margin: "0 0 4px", fontSize: "13px", lineHeight: "20px", color: coloriEmail.testoTenue }}>
        Se il pulsante non funziona, copia e incolla questo indirizzo nel browser:
      </Text>
      <Text style={{ margin: "0 0 16px", fontSize: "13px", lineHeight: "20px", wordBreak: "break-all" }}>
        <Link href={href} className="e-link" style={{ color: coloriEmail.primario }}>
          {href}
        </Link>
      </Text>
    </>
  );
}
