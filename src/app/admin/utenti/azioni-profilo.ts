"use server";

import { richiediAdmin } from "@/lib/auth/admin";
import { leggiProfiloCliente } from "@/lib/profilo/dati";
import { statoRichiesta } from "@/lib/profilo/ricontatto";
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
      { etichetta: "Richiesta di ricontatto", valore: descriviRichiesta(profilo), multilinea: false },
      ...(statoRichiesta(profilo) === "in_attesa" && profilo.contact_request_notes
        ? [{ etichetta: "Note della richiesta", valore: profilo.contact_request_notes, multilinea: true }]
        : []),
    ],
  };
  return { gruppi: [account, ...riepilogoProfilo(profilo, immobile)] };
}

function descriviRichiesta(profilo: Parameters<typeof statoRichiesta>[0]) {
  switch (statoRichiesta(profilo)) {
    case "in_attesa":
      return `Da ricontattare (richiesta del ${formatoData.format(new Date(profilo.contact_request_at!))})`;
    case "gestita":
      return `Gestita il ${formatoData.format(new Date(profilo.contact_request_handled_at!))}`;
    default:
      return null;
  }
}
