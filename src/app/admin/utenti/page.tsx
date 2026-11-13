import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PhoneCallIcon, SearchIcon } from "lucide-react";

import { AcquistiUtente, type RigaAcquisto } from "@/app/admin/utenti/acquisti-utente";
import { AzioniUtente, InterruttoreGuida } from "@/app/admin/utenti/azioni-utente";
import { ProfiloUtente } from "@/app/admin/utenti/profilo-utente";
import { RicontattoUtente } from "@/app/admin/utenti/ricontatto-utente";
import { NuovoUtente } from "@/app/admin/utenti/nuovo-utente";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { richiediAdmin } from "@/lib/auth/admin";
import { aBlocchi } from "@/lib/blocchi";
import { calcolaCompletamento } from "@/lib/profilo/completamento";
import { statoRichiesta } from "@/lib/profilo/ricontatto";
import { creaClientServer } from "@/lib/supabase/server";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

export const metadata: Metadata = {
  title: "Utenti",
};

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function PaginaUtenti({ searchParams }: PageProps<"/admin/utenti">) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Utenti</h1>
          <p className="text-muted-foreground">
            Crea account, consulta gli acquisti, assegna o revoca la guida, blocca gli
            account e gestisci gli amministratori.
          </p>
        </div>
        <NuovoUtente />
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento utenti…</p>}>
        <ElencoUtenti searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** Toglie i caratteri che hanno un significato nei filtri di PostgREST. */
const pulisciRicerca = (valore: unknown) =>
  typeof valore === "string" ? valore.replace(/[,()%*\\]/g, " ").trim().slice(0, 80) : "";

async function ElencoUtenti({ searchParams }: Pick<PageProps<"/admin/utenti">, "searchParams">) {
  const admin = await richiediAdmin();
  const parametri = await searchParams;
  const ricerca = pulisciRicerca(parametri.q);
  const soloRicontatto = parametri.ricontatto === "1";

  // La RLS consente agli admin di leggere tutti i profili.
  const supabase = await creaClientServer();
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (ricerca) {
    const filtro = `%${ricerca}%`;
    query = query.or(
      `email.ilike.${filtro},first_name.ilike.${filtro},last_name.ilike.${filtro}`,
    );
  }
  if (soloRicontatto) query = query.not("contact_request_at", "is", null);
  const { data: risultati, error } = await query;

  if (error) {
    console.error("Lettura utenti non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a caricare gli utenti.</p>;
  }
  // Richieste ancora aperte: quelle gestite prima di una nuova richiesta contano come aperte.
  const utenti = soloRicontatto
    ? risultati.filter((u) => statoRichiesta(u) === "in_attesa")
    : risultati;
  const { data: richieste } = await supabase
    .from("profiles")
    .select("contact_request_at, contact_request_handled_at")
    .not("contact_request_at", "is", null);
  const daRicontattare = (richieste ?? []).filter((r) => statoRichiesta(r) === "in_attesa").length;

  // Acquisti degli utenti in elenco (la RLS consente agli admin di leggerli tutti).
  const acquistiPerUtente = new Map<string, RigaAcquisto[]>();
  // Gli id vanno a blocchi: con centinaia di utenti l'URL di `in(...)` sarebbe troppo lungo.
  const blocchiId = aBlocchi(utenti.map((u) => u.id), 100);
  const risposteAcquisti = await Promise.all(
    blocchiId.map((ids) =>
      supabase
        .from("purchases")
        .select("id, user_id, product, status, amount_total, currency, stripe_payment_intent_id, paid_at, created_at")
        .in("user_id", ids)
        .neq("status", "in_attesa")
        .order("created_at", { ascending: false }),
    ),
  );
  for (const { data: acquisti, error: erroreAcquisti } of risposteAcquisti) {
    if (erroreAcquisti) console.error("Lettura acquisti non riuscita", erroreAcquisti);
    for (const { user_id, ...acquisto } of acquisti ?? []) {
      if (!user_id) continue;
      acquistiPerUtente.set(user_id, [...(acquistiPerUtente.get(user_id) ?? []), acquisto]);
    }
  }

  // Immobili dei clienti in elenco, per completamento e popup del profilo.
  const immobili = new Map<string, Immobile>();
  const risposteImmobili = await Promise.all(
    blocchiId.map((ids) => supabase.from("properties").select("*").in("user_id", ids)),
  );
  for (const { data, error: erroreImmobili } of risposteImmobili) {
    if (erroreImmobili) console.error("Lettura immobili non riuscita", erroreImmobili);
    for (const immobile of data ?? []) immobili.set(immobile.user_id, immobile);
  }

  const urlPagamentiStripe = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
    ? "https://dashboard.stripe.com/payments"
    : "https://dashboard.stripe.com/test/payments";

  return (
    <div className="space-y-4">
      <form role="search" className="flex max-w-md gap-2">
        <label htmlFor="ricerca" className="sr-only">
          Cerca per nome o email
        </label>
        <Input
          id="ricerca"
          name="q"
          type="search"
          placeholder="Cerca per nome o email"
          defaultValue={ricerca}
        />
        <Button type="submit" variant="outline" size="lg">
          <SearchIcon aria-hidden />
          Cerca
        </Button>
      </form>

      {daRicontattare > 0 && !soloRicontatto && (
        <Link
          href="/admin/utenti?ricontatto=1"
          className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium hover:bg-primary/10"
        >
          <PhoneCallIcon className="size-4 text-primary" aria-hidden />
          {daRicontattare === 1
            ? "1 cliente chiede di essere ricontattato"
            : `${daRicontattare} clienti chiedono di essere ricontattati`}
          <span className="ml-auto text-primary underline-offset-4">Mostra</span>
        </Link>
      )}

      <p className="text-sm text-muted-foreground">
        {soloRicontatto ? (
          <>
            {utenti.length} da ricontattare ·{" "}
            <Link href="/admin/utenti" className="underline underline-offset-4">
              mostra tutti
            </Link>
          </>
        ) : ricerca ? (
          <>
            {utenti.length} risultati per «{ricerca}» ·{" "}
            <Link href="/admin/utenti" className="underline underline-offset-4">
              mostra tutti
            </Link>
          </>
        ) : (
          `${utenti.length} utenti registrati`
        )}
      </p>

      {utenti.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[60rem] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Utente</th>
                <th scope="col" className="px-4 py-3 font-medium">Registrato</th>
                <th scope="col" className="px-4 py-3 font-medium">Guida</th>
                <th scope="col" className="px-4 py-3 font-medium">Acquisti</th>
                <th scope="col" className="px-4 py-3 font-medium">Profilo</th>
                <th scope="col" className="px-4 py-3 font-medium">Stato</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {utenti.map((utente) => (
                <RigaUtente
                  key={utente.id}
                  utente={utente}
                  seiTu={utente.id === admin.id}
                  acquisti={acquistiPerUtente.get(utente.id) ?? []}
                  immobile={immobili.get(utente.id) ?? null}
                  urlPagamentiStripe={urlPagamentiStripe}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RigaUtente({
  utente,
  seiTu,
  acquisti,
  immobile,
  urlPagamentiStripe,
}: {
  utente: Profilo;
  seiTu: boolean;
  acquisti: RigaAcquisto[];
  immobile: Immobile | null;
  urlPagamentiStripe: string;
}) {
  const nomeCompleto = [utente.first_name, utente.last_name].filter(Boolean).join(" ");
  const ricontatto = statoRichiesta(utente) === "in_attesa" && utente.contact_request_at;
  return (
    <tr className={utente.is_blocked ? "bg-muted/40" : ricontatto ? "bg-primary/5" : undefined}>
      <td className="px-4 py-3">
        <p className="font-medium">{nomeCompleto || "Profilo da completare"}</p>
        <p className="text-muted-foreground">{utente.email}</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {formatoData.format(new Date(utente.created_at))}
      </td>
      <td className="px-4 py-3">
        <InterruttoreGuida id={utente.id} attivo={utente.guide_access} />
      </td>
      <td className="px-4 py-3">
        <AcquistiUtente
          nome={nomeCompleto || utente.email}
          acquisti={acquisti}
          urlPagamentiStripe={urlPagamentiStripe}
        />
      </td>
      <td className="px-4 py-3">
        <ProfiloUtente
          id={utente.id}
          nome={nomeCompleto || utente.email}
          percentuale={calcolaCompletamento(utente, immobile).percentuale}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          {ricontatto && (
            <RicontattoUtente
              id={utente.id}
              nome={nomeCompleto || utente.email}
              email={utente.email}
              dati={{
                richiestaIl: ricontatto,
                note: utente.contact_request_notes,
                telefono: utente.phone,
                contatto: utente.contact_preference,
                orario: utente.contact_time,
              }}
            />
          )}
          {utente.role === "admin" && <Badge>Admin</Badge>}
          {utente.is_blocked ? (
            <Badge variant="destructive">Bloccato</Badge>
          ) : (
            <Badge variant="outline">Attivo</Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <AzioniUtente
          id={utente.id}
          nome={nomeCompleto || utente.email}
          bloccato={utente.is_blocked}
          ruolo={utente.role}
          seiTu={seiTu}
        />
      </td>
    </tr>
  );
}
