import { Section, Text } from "react-email";

import { formattaPrezzo, prodotti, type CodiceProdotto } from "@/lib/prodotti";
import {
  LayoutEmail,
  PulsanteEmail,
  TestoEmail,
  TitoloEmail,
  coloriEmail,
  urlApp,
} from "./componenti/layout-email";

/**
 * Conferma d'acquisto inviata dall'app con Resend dopo il webhook Stripe.
 * Con `urlAccesso` (acquisto senza account, Fase 7) il pulsante porta
 * direttamente nell'area riservata con un link di accesso personale;
 * altrimenti apre il prodotto (serve aver già fatto l'accesso).
 */
export type PropsConfermaAcquisto = {
  prodotto: CodiceProdotto;
  /** Importo pagato in centesimi. */
  importoCentesimi: number;
  /** Data del pagamento (ISO). */
  pagatoIl: string;
  urlAccesso?: string;
  nome?: string | null;
};

export default function EmailConfermaAcquisto({
  prodotto,
  importoCentesimi,
  pagatoIl,
  urlAccesso,
  nome,
}: PropsConfermaAcquisto) {
  const scheda = prodotti[prodotto];
  const href = urlAccesso ?? `${urlApp()}${scheda.href}`;
  const data = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" }).format(
    new Date(pagatoIl),
  );

  const righe = [
    { etichetta: "Prodotto", valore: `${scheda.nome} — ${scheda.titoloCompleto}` },
    { etichetta: "Importo", valore: formattaPrezzo(importoCentesimi / 100) },
    { etichetta: "Data", valore: data },
  ];

  return (
    <LayoutEmail anteprima={`Grazie per l'acquisto: ${scheda.nome.toLowerCase()} è già disponibile.`}>
      <TitoloEmail>Grazie per l&apos;acquisto{nome ? `, ${nome}` : ""}!</TitoloEmail>
      <TestoEmail>
        Il pagamento è andato a buon fine e {scheda.nome.toLowerCase()} è già disponibile nella tua area riservata. Puoi
        leggerla da smartphone, tablet e computer.
      </TestoEmail>

      <Section
        className="e-bordo"
        style={{ border: `1px solid ${coloriEmail.bordo}`, borderRadius: "8px", padding: "4px 16px", margin: "0 0 24px" }}
      >
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <tbody>
            {righe.map((riga, i) => (
              <tr key={riga.etichetta}>
                <td
                  className="e-tenue e-bordo"
                  style={{
                    padding: "12px 12px 12px 0",
                    fontSize: "14px",
                    color: coloriEmail.testoTenue,
                    borderTop: i ? `1px solid ${coloriEmail.bordo}` : "none",
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  {riga.etichetta}
                </td>
                <td
                  className="e-testo e-bordo"
                  style={{
                    padding: "12px 0",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: coloriEmail.testo,
                    borderTop: i ? `1px solid ${coloriEmail.bordo}` : "none",
                    textAlign: "right",
                  }}
                >
                  {riga.valore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <PulsanteEmail href={href}>{scheda.etichettaApri}</PulsanteEmail>

      <TestoEmail tenue>
        {urlAccesso
          ? "Il pulsante ti fa entrare direttamente e vale per un solo accesso. Le volte successive accedi da app.guidocontesini.it con la tua email: ti invieremo un nuovo link."
          : "Per entrare usa la stessa email con cui hai acquistato."}
      </TestoEmail>
      <Text
        className="e-tenue"
        style={{ margin: 0, fontSize: "14px", lineHeight: "22px", color: coloriEmail.testoTenue }}
      >
        La ricevuta del pagamento ti arriva in un&apos;email separata da Stripe, il nostro sistema di pagamento.
      </Text>
    </LayoutEmail>
  );
}

EmailConfermaAcquisto.PreviewProps = {
  prodotto: "guida",
  importoCentesimi: 2900,
  pagatoIl: "2026-11-14T10:30:00Z",
  nome: "Mario",
} satisfies PropsConfermaAcquisto;
