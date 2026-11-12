"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createElement } from "react";

import EmailAccountEliminato from "@/emails/account-eliminato";

import { PERCORSO_ACCESSO } from "@/lib/auth/percorsi";
import { leggiProfiloCorrente } from "@/lib/auth/utente";
import { inviaEmail } from "@/lib/email/invia";
import { isConfermaEliminazione, PAROLA_CONFERMA } from "@/lib/profilo/account";
import { sezionePerId, type IdSezione } from "@/lib/profilo/campi";
import { validaSezione } from "@/lib/profilo/validazione";
import { creaClientAdmin } from "@/lib/supabase/admin";
import { creaClientServer } from "@/lib/supabase/server";
import type { Database, Profilo } from "@/lib/supabase/tipi";

export type StatoSezione = {
  errori: Record<string, string>;
  inviati?: Record<string, string>;
  /** Momento dell'ultimo salvataggio riuscito (mostra "Salvato"). */
  salvatoIl?: number;
  erroreGenerale?: string;
};

/**
 * Salva una sezione del profilo. L'utente è sempre quello collegato (mai un
 * id dal browser); la RLS e i grant per colonna limitano comunque cosa può
 * scrivere. La riga dell'immobile nasce al primo salvataggio.
 */
export async function salvaSezione(idSezione: IdSezione, _stato: StatoSezione, formData: FormData): Promise<StatoSezione> {
  const sezione = sezionePerId(idSezione);
  if (!sezione) return { errori: {}, erroreGenerale: "Sezione non valida." };

  const { valori, errori, inviati } = validaSezione(sezione, formData);
  if (Object.keys(errori).length > 0) return { errori, inviati };

  const profilo = await leggiProfiloCorrente();
  const supabase = await creaClientServer();
  const { error } =
    sezione.tabella === "profiles"
      ? // I valori arrivano da `validaSezione`: solo colonne e valori ammessi della sezione.
        await supabase.from("profiles").update(valori as Partial<Profilo>).eq("id", profilo.id)
      : await supabase
          .from("properties")
          .upsert({ ...(valori as Database["public"]["Tables"]["properties"]["Update"]), user_id: profilo.id }, { onConflict: "user_id" });

  if (error) {
    console.error(`Salvataggio della sezione ${idSezione} non riuscito`, error);
    return { errori: {}, inviati, erroreGenerale: "Non siamo riusciti a salvare. Riprova tra poco." };
  }

  revalidatePath("/dashboard/profilo");
  revalidatePath("/dashboard");
  return { errori: {}, salvatoIl: Date.now() };
}

export type StatoEliminazione = { errore?: string };

/**
 * Eliminazione dell'account da parte del cliente (GDPR art. 17), dopo aver
 * scritto ELIMINA. Si cancellano account, profilo e immobile (cascade); gli
 * acquisti restano senza collegamento all'utente per gli obblighi fiscali.
 * Gli admin non si eliminano da qui, per non lasciare l'app senza amministratori.
 */
export async function eliminaAccount(_stato: StatoEliminazione, formData: FormData): Promise<StatoEliminazione> {
  if (!isConfermaEliminazione(formData.get("conferma"))) {
    return { errore: `Per confermare scrivi ${PAROLA_CONFERMA}.` };
  }

  const profilo = await leggiProfiloCorrente();
  if (profilo.role === "admin") {
    return { errore: "Gli account amministratore non si eliminano da qui: chiedi a un altro admin." };
  }

  const { error } = await creaClientAdmin().auth.admin.deleteUser(profilo.id);
  if (error) {
    console.error("Eliminazione dell'account da parte del cliente non riuscita", error);
    return { errore: "Non siamo riusciti a eliminare l'account. Riprova o scrivici." };
  }

  try {
    await inviaEmail({
      a: profilo.email,
      oggetto: "Il tuo account è stato eliminato",
      email: createElement(EmailAccountEliminato, { nome: profilo.first_name }),
    });
  } catch (errore) {
    // L'account è già eliminato: l'email di conferma non deve bloccare l'uscita.
    console.error("Email di conferma dell'eliminazione non inviata", errore);
  }

  // Toglie i cookie di una sessione che non esiste più.
  const supabase = await creaClientServer();
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  redirect(`${PERCORSO_ACCESSO}?motivo=account-eliminato`);
}
