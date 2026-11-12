import { etichettaValore, sezioni } from "@/lib/profilo/campi";
import { formattaPrezzo, isCodiceProdotto, prodotti } from "@/lib/prodotti";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

/** Parola da scrivere per confermare l'eliminazione dell'account. */
export const PAROLA_CONFERMA = "ELIMINA";

export function isConfermaEliminazione(testo: unknown) {
  return typeof testo === "string" && testo.trim().toUpperCase() === PAROLA_CONFERMA;
}

export type AcquistoEsportato = {
  product: string;
  status: string;
  amount_total: number | null;
  currency: string;
  paid_at: string | null;
  created_at: string;
};

/** "Via e numero civico" → "via_e_numero_civico". */
const chiave = (etichetta: string) =>
  etichetta
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const statiAcquisto: Record<string, string> = {
  pagato: "Pagato",
  rimborsato: "Rimborsato",
  contestato: "Contestato",
  in_attesa: "In attesa",
};

/**
 * Dati del cliente per il diritto di accesso e portabilità (GDPR art. 15 e 20):
 * account, immobile e acquisti con chiavi e valori leggibili. Esclusi i dati
 * tecnici interni (id, sessione, ruolo e permessi).
 */
export function datiEsportati(
  profilo: Partial<Profilo>,
  immobile: Partial<Immobile> | null,
  acquisti: AcquistoEsportato[],
) {
  const sezionePersonale = sezioni.find((s) => s.tabella === "profiles")!;
  const account: Record<string, string | boolean | null> = {
    email: profilo.email ?? null,
    ...Object.fromEntries(
      sezionePersonale.campi.map((campo) => [
        chiave(campo.etichetta),
        etichettaValore(campo, (profilo as Record<string, unknown>)[campo.nome]),
      ]),
    ),
    nome: profilo.first_name ?? null,
    cognome: profilo.last_name ?? null,
    consenso_comunicazioni_promozionali: profilo.marketing_consent ?? false,
    privacy_accettata_il: profilo.privacy_accepted_at ?? null,
    account_creato_il: profilo.created_at ?? null,
  };

  const datiImmobile = immobile
    ? Object.fromEntries(
        sezioni
          .filter((s) => s.tabella === "properties")
          .flatMap((s) => s.campi)
          .map((campo) => [
            chiave(campo.etichetta),
            etichettaValore(campo, (immobile as Record<string, unknown>)[campo.nome]),
          ]),
      )
    : null;

  return {
    esportatoIl: new Date().toISOString(),
    servizio: "Vendere Casa da Privato (app.guidocontesini.it)",
    account,
    immobile: datiImmobile,
    acquisti: acquisti.map((a) => ({
      prodotto: isCodiceProdotto(a.product) ? prodotti[a.product].nome : a.product,
      stato: statiAcquisto[a.status] ?? a.status,
      importo: a.amount_total !== null ? formattaPrezzo(a.amount_total / 100) : null,
      pagato_il: a.paid_at,
      creato_il: a.created_at,
    })),
  };
}
