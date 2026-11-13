import { Section, Text } from "react-email";

import type { ContenutoNotifica } from "@/lib/notifiche/eventi";
import {
  LayoutEmail,
  PulsanteEmail,
  TestoEmail,
  TitoloEmail,
  coloriEmail,
  urlApp,
} from "./componenti/layout-email";

/**
 * Notifica agli admin (Fase 9): breve, con i dati essenziali dell'evento e il
 * pulsante per aprire il cliente in admin. Il "Rispondi a" è l'email del
 * cliente (impostato all'invio), così si risponde direttamente a lui.
 */
export type PropsNotificaAdmin = {
  contenuto: ContenutoNotifica;
  /** Email del cliente: il pulsante apre la tabella utenti filtrata su di lui. */
  emailCliente?: string | null;
  /** Notifica di prova inviata da /admin/notifiche. */
  prova?: boolean;
};

const coloreUrgente = "#b42318";

export default function EmailNotificaAdmin({ contenuto, emailCliente, prova = false }: PropsNotificaAdmin) {
  const pulsante =
    contenuto.pulsante ??
    (emailCliente
      ? { etichetta: "Apri la scheda del cliente", href: `${urlApp()}/admin/utenti?q=${encodeURIComponent(emailCliente)}` }
      : { etichetta: "Apri l'amministrazione", href: `${urlApp()}/admin` });

  return (
    <LayoutEmail anteprima={contenuto.oggetto}>
      {(contenuto.urgente || prova) && (
        <Text
          style={{
            margin: "0 0 12px",
            fontSize: "12px",
            lineHeight: "16px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: prova ? coloriEmail.primario : coloreUrgente,
          }}
        >
          {prova ? "Notifica di prova" : "Da gestire subito"}
        </Text>
      )}
      <TitoloEmail>{contenuto.titolo}</TitoloEmail>
      <TestoEmail>{contenuto.testo}</TestoEmail>

      {contenuto.avviso && (
        <Section
          style={{
            border: `1px solid ${coloreUrgente}`,
            borderRadius: "8px",
            padding: "12px 16px",
            margin: "0 0 20px",
          }}
        >
          <Text style={{ margin: 0, fontSize: "15px", lineHeight: "22px", fontWeight: 600, color: coloreUrgente }}>
            {contenuto.avviso}
          </Text>
        </Section>
      )}

      <Section
        className="e-bordo"
        style={{ border: `1px solid ${coloriEmail.bordo}`, borderRadius: "8px", padding: "4px 16px", margin: "0 0 24px" }}
      >
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <tbody>
            {contenuto.righe.map((riga, i) => (
              <tr key={`${riga.etichetta}-${i}`}>
                <td
                  className="e-tenue e-bordo"
                  style={{
                    padding: "10px 12px 10px 0",
                    fontSize: "14px",
                    color: coloriEmail.testoTenue,
                    borderTop: i ? `1px solid ${coloriEmail.bordo}` : "none",
                    verticalAlign: "top",
                    width: "40%",
                  }}
                >
                  {riga.etichetta}
                </td>
                <td
                  className="e-testo e-bordo"
                  style={{
                    padding: "10px 0",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: coloriEmail.testo,
                    borderTop: i ? `1px solid ${coloriEmail.bordo}` : "none",
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                  }}
                >
                  {riga.valore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <PulsanteEmail href={pulsante.href}>{pulsante.etichetta}</PulsanteEmail>

      <TestoEmail tenue>
        {emailCliente
          ? "Rispondendo a questa email scrivi direttamente al cliente. "
          : ""}
        Ricevi questa notifica perché sei tra i destinatari in Amministrazione → Notifiche.
      </TestoEmail>
    </LayoutEmail>
  );
}

EmailNotificaAdmin.PreviewProps = {
  contenuto: {
    oggetto: "[Urgente] Richiesta di ricontatto: Mario Rossi",
    titolo: "Richiesta di ricontatto",
    testo: "Il cliente vorrebbe essere ricontattato da Guido per una consulenza.",
    righe: [
      { etichetta: "Cliente", valore: "Mario Rossi (mario@example.com)" },
      { etichetta: "Telefono", valore: "333 123 4567" },
      { etichetta: "Contatto preferito", valore: "WhatsApp" },
      { etichetta: "Note", valore: "Vorrei capire se il prezzo che ho in mente è realistico." },
    ],
    urgente: true,
  },
  emailCliente: "mario@example.com",
} satisfies PropsNotificaAdmin;
