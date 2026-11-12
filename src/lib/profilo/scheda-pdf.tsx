import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import { calcolaCompletamento } from "@/lib/profilo/completamento";
import { riepilogoProfilo } from "@/lib/profilo/riepilogo";
import { formattaPrezzo, isCodiceProdotto, prodotti } from "@/lib/prodotti";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

export type AcquistoScheda = {
  product: string;
  status: string;
  amount_total: number | null;
  paid_at: string | null;
};

const BLU = "#2b5bd7";
const SCURO = "#0f1e33";
const TENUE = "#5b6577";
const BORDO = "#e3e7ee";

const stili = StyleSheet.create({
  pagina: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 44, fontFamily: "Helvetica", fontSize: 10, color: SCURO },
  intestazione: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  logo: { width: 34, height: 34, borderRadius: 6 },
  marchio: { fontSize: 9, color: TENUE },
  titolo: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  riepilogo: { borderWidth: 1, borderColor: BORDO, borderRadius: 6, padding: 12, marginBottom: 16, gap: 3 },
  nome: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  sezione: { marginBottom: 12 },
  titoloSezione: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BLU, marginBottom: 4 },
  riga: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDO, paddingVertical: 4 },
  etichetta: { width: "42%", color: TENUE, paddingRight: 8 },
  valore: { width: "58%" },
  vuota: { color: TENUE, fontStyle: "italic" },
  piede: { position: "absolute", bottom: 24, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: TENUE },
});

const formatoData = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" });
const statiAcquisto: Record<string, string> = {
  pagato: "Pagato",
  rimborsato: "Rimborsato",
  contestato: "Contestato",
  in_attesa: "In attesa",
};

function Righe({
  righe,
  vuota = "Non compilata",
}: {
  righe: { etichetta: string; valore: string; multilinea?: boolean }[];
  vuota?: string;
}) {
  if (righe.length === 0) return <Text style={stili.vuota}>{vuota}</Text>;
  return (
    <View>
      {righe.map(({ etichetta, valore, multilinea }) => (
        // Le righe brevi non si spezzano tra due pagine; note e documenti sì,
        // altrimenti un testo più alto di una pagina non entrerebbe.
        <View key={etichetta} style={stili.riga} wrap={!!multilinea}>
          <Text style={stili.etichetta}>{etichetta}</Text>
          <Text style={stili.valore}>{valore}</Text>
        </View>
      ))}
    </View>
  );
}

/** Scheda cliente in PDF per Guido: contatti, immobile, situazione, obiettivi, note e acquisti. */
export async function generaSchedaPdf({
  profilo,
  immobile,
  acquisti,
}: {
  profilo: Profilo;
  immobile: Immobile | null;
  acquisti: AcquistoScheda[];
}) {
  const logo = await fs.readFile(path.join(process.cwd(), "public/email/logo.png"));
  const { percentuale } = calcolaCompletamento(profilo, immobile);
  const nome = [profilo.first_name, profilo.last_name].filter(Boolean).join(" ") || "Cliente senza nome";
  const generataIl = formatoData.format(new Date());

  // Solo i campi compilati (e pertinenti).
  const gruppi = riepilogoProfilo(profilo, immobile).map(({ titolo, righe }) => ({
    titolo,
    righe: righe.flatMap((r) => (r.valore ? [{ ...r, valore: r.valore }] : [])),
  }));

  const righeAcquisti = acquisti.map((a) => ({
    etichetta: `${isCodiceProdotto(a.product) ? prodotti[a.product].nome : a.product}${a.paid_at ? ` · ${formatoData.format(new Date(a.paid_at))}` : ""}`,
    valore: `${a.amount_total !== null ? formattaPrezzo(a.amount_total / 100) : "—"} · ${statiAcquisto[a.status] ?? a.status}`,
  }));

  return renderToBuffer(
    <Document title={`Scheda cliente - ${nome}`} author="Vendere Casa da Privato">
      <Page size="A4" style={stili.pagina}>
        <View style={stili.intestazione}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image di react-pdf, non un elemento HTML */}
          <Image src={logo} style={stili.logo} />
          <View>
            <Text style={stili.marchio}>Vendere Casa da Privato · Guido Contesini</Text>
            <Text style={stili.titolo}>Scheda cliente</Text>
          </View>
        </View>

        <View style={stili.riepilogo}>
          <Text style={stili.nome}>{nome}</Text>
          <Text>{profilo.email}</Text>
          {profilo.phone && <Text>Tel. {profilo.phone}</Text>}
          <Text style={{ color: TENUE }}>
            Profilo completo al {percentuale}% · Cliente dal {formatoData.format(new Date(profilo.created_at))}
          </Text>
        </View>

        {gruppi.map(({ titolo, righe }) => (
          <View key={titolo} style={stili.sezione}>
            <Text style={stili.titoloSezione}>{titolo}</Text>
            <Righe righe={righe} />
          </View>
        ))}

        <View style={stili.sezione}>
          <Text style={stili.titoloSezione}>Acquisti</Text>
          <Righe righe={righeAcquisti} vuota="Nessun acquisto" />
        </View>

        <View style={stili.piede} fixed>
          <Text>Generata il {generataIl} · Riservata: contiene dati personali</Text>
          <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} di ${totalPages}`} />
        </View>
      </Page>
    </Document>,
  );
}
