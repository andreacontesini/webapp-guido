import { ImageResponse } from "next/og";

/**
 * Immagine di anteprima predefinita per la condivisione (1200×630), usata
 * dalla pagina iniziale e dalle landing senza un'immagine propria.
 * Colori del tema scuro dell'app.
 */
export const alt = "Una vendita buona e giusta — la guida di Guido Contesini per vendere casa da privato";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SFONDO = "#0e1116";
const TESTO = "#f2f4f8";
const TENUE = "#9aa3b2";
const BLU = "#6b95ff";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `radial-gradient(circle at 85% 10%, rgba(107,149,255,0.35), ${SFONDO} 55%)`,
          color: TESTO,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: TENUE }}>
          GUIDA PRATICA · 7 TAPPE · 18 PAGINE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Vendi casa da privato,
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05, color: BLU }}>
            senza sorprese
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: TENUE }}>
            Dai controlli sull&apos;immobile al rogito dal notaio
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
              Una vendita buona e giusta
            </div>
            <div style={{ display: "flex", fontSize: 26, color: TENUE, marginTop: 6 }}>
              Guido Contesini · Consulente immobiliare, Lago di Garda
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} style={{ width: 36, height: 8, borderRadius: 4, background: BLU }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
