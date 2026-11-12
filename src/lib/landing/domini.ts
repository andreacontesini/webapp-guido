import type { DominioLanding } from "@/lib/supabase/tipi";

/**
 * Domini su cui si può pubblicare una landing. Il dominio principale ospita
 * ancora il sito WordPress: l'opzione è visibile ma disattivata finché non
 * attiviamo lo smistamento per dominio (vedi TODO.md, "In futuro").
 */
export const DOMINI_LANDING: {
  valore: DominioLanding;
  etichetta: string;
  host: string;
  attivo: boolean;
}[] = [
  { valore: "app", etichetta: "App", host: "app.guidocontesini.it", attivo: true },
  { valore: "principale", etichetta: "Dominio principale", host: "guidocontesini.it", attivo: false },
];

export const isDominioAttivo = (valore: unknown): valore is DominioLanding =>
  DOMINI_LANDING.some((d) => d.valore === valore && d.attivo);
