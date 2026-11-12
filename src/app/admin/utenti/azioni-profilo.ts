"use server";

import { richiediAdmin } from "@/lib/auth/admin";
import { leggiProfiloCliente } from "@/lib/profilo/dati";
import { riepilogoProfilo, type GruppoRiepilogo } from "@/lib/profilo/riepilogo";

export type DettaglioProfilo = { gruppi: GruppoRiepilogo[] } | { errore: string };

const formatoId = /^[0-9a-f-]{36}$/i;
const formatoData = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" });

/**
 * Dati del profilo di un cliente per il popup admin, letti solo quando il
 * popup si apre: la tabella utenti non porta con sé via, note e dati della
 * casa di tutti i clienti.
 */
export async function leggiDettaglioProfilo(id: string): Promise<DettaglioProfilo> {
  await richiediAdmin();
  if (!formatoId.test(id)) return { errore: "Utente non valido." };

  const dati = await leggiProfiloCliente(id);
  if (!dati) return { errore: "Utente non trovato." };
  const { profilo, immobile } = dati;

  const account: GruppoRiepilogo = {
    titolo: "Account",
    righe: [
      { etichetta: "Email", valore: profilo.email, multilinea: false },
      {
        etichetta: "Privacy accettata",
        valore: profilo.privacy_accepted_at ? formatoData.format(new Date(profilo.privacy_accepted_at)) : null,
        multilinea: false,
      },
      { etichetta: "Comunicazioni promozionali", valore: profilo.marketing_consent ? "Sì" : "No", multilinea: false },
    ],
  };
  return { gruppi: [account, ...riepilogoProfilo(profilo, immobile)] };
}
