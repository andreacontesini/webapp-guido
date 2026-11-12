import "server-only";

import { creaClientAdmin } from "@/lib/supabase/admin";
import type { TipoEventoLanding } from "@/lib/supabase/tipi";

/**
 * Misurazione delle conversioni delle landing (visita → checkout → acquisto).
 * Rispetta la privacy: nessun cookie, nessun identificativo del visitatore,
 * nessun indirizzo IP; si salvano solo landing, tipo di evento e data.
 */

const formatoUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isIdLanding = (valore: unknown): valore is string =>
  typeof valore === "string" && formatoUuid.test(valore);

/** Registra un evento; non lancia mai errori (la misurazione non deve bloccare nulla). */
export async function registraEventoLanding(landingId: string, tipo: TipoEventoLanding) {
  if (!isIdLanding(landingId)) return;
  try {
    const { error } = await creaClientAdmin()
      .from("landing_events")
      .insert({ landing_id: landingId, type: tipo });
    // 23503: la landing non esiste (id inventato o landing eliminata).
    if (error && error.code !== "23503") {
      console.error(`Evento landing "${tipo}" non registrato`, error);
    }
  } catch (errore) {
    console.error(`Evento landing "${tipo}" non registrato`, errore);
  }
}
