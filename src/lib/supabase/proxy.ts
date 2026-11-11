import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  PERCORSO_ACCESSO,
  PERCORSO_BENVENUTO,
  PERCORSO_ESCI,
  PERCORSO_INIZIALE,
  isPercorsoProtetto,
  type MotivoUscita,
} from "@/lib/auth/percorsi";
import { configSupabase } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/tipi";

/**
 * Eseguita da `src/proxy.ts` a ogni richiesta di pagina:
 * 1. rinnova i cookie di sessione Supabase;
 * 2. manda alla pagina di accesso chi non è autenticato;
 * 3. fa uscire gli utenti bloccati o con una sessione non più valida
 *    (accesso da un altro dispositivo);
 * 4. porta al primo accesso (`/benvenuto`) chi non ha completato il profilo.
 */
export async function aggiornaSessione(request: NextRequest) {
  let risposta = NextResponse.next({ request });
  const { url, chiaveAnonima } = configSupabase();

  const supabase = createServerClient<Database>(url, chiaveAnonima, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookieDaImpostare, intestazioni) {
        for (const { name, value } of cookieDaImpostare) {
          request.cookies.set(name, value);
        }
        risposta = NextResponse.next({ request });
        for (const { name, value, options } of cookieDaImpostare) {
          risposta.cookies.set(name, value, options);
        }
        for (const [chiave, valore] of Object.entries(intestazioni ?? {})) {
          risposta.headers.set(chiave, valore);
        }
      },
    },
  });

  // Non inserire codice tra la creazione del client e getClaims():
  // è qui che la sessione viene verificata e, se serve, rinnovata.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const { pathname } = request.nextUrl;

  /** Redirect che conserva i cookie appena aggiornati. */
  const vaiA = (percorso: string, parametri?: Record<string, string>) => {
    const destinazione = request.nextUrl.clone();
    destinazione.pathname = percorso;
    destinazione.search = "";
    for (const [k, v] of Object.entries(parametri ?? {})) {
      destinazione.searchParams.set(k, v);
    }
    const redirect = NextResponse.redirect(destinazione);
    for (const cookie of risposta.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  };
  const esci = (motivo: MotivoUscita) => vaiA(PERCORSO_ESCI, { motivo });

  if (!claims) {
    if (isPercorsoProtetto(pathname)) {
      return vaiA(PERCORSO_ACCESSO, { next: pathname });
    }
    return risposta;
  }

  const suPaginaAccesso = pathname === PERCORSO_ACCESSO;
  if (!isPercorsoProtetto(pathname) && !suPaginaAccesso) {
    return risposta;
  }

  const { data: profilo } = await supabase
    .from("profiles")
    .select("is_blocked, onboarded_at, current_session_id")
    .eq("id", claims.sub)
    .maybeSingle();

  if (!profilo) return esci("errore");
  if (profilo.is_blocked) return esci("bloccato");

  if (!profilo.current_session_id) {
    // Profilo senza sessione registrata: questa diventa quella valida.
    await supabase.rpc("registra_sessione_corrente");
  } else if (profilo.current_session_id !== claims.session_id) {
    return esci("altra-sessione");
  }

  if (suPaginaAccesso) {
    return vaiA(profilo.onboarded_at ? PERCORSO_INIZIALE : PERCORSO_BENVENUTO);
  }
  if (!profilo.onboarded_at && pathname !== PERCORSO_BENVENUTO) {
    return vaiA(PERCORSO_BENVENUTO);
  }
  if (profilo.onboarded_at && pathname === PERCORSO_BENVENUTO) {
    return vaiA(PERCORSO_INIZIALE);
  }

  return risposta;
}
