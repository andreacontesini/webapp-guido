import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchIcon } from "lucide-react";

import { AcquistiUtente, type RigaAcquisto } from "@/app/admin/utenti/acquisti-utente";
import { AzioniUtente, InterruttoreGuida } from "@/app/admin/utenti/azioni-utente";
import { NuovoUtente } from "@/app/admin/utenti/nuovo-utente";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { richiediAdmin } from "@/lib/auth/admin";
import { creaClientServer } from "@/lib/supabase/server";
import type { Profilo } from "@/lib/supabase/tipi";

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
  const ricerca = pulisciRicerca((await searchParams).q);

  // La RLS consente agli admin di leggere tutti i profili.
  const supabase = await creaClientServer();
  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, is_blocked, guide_access, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (ricerca) {
    const filtro = `%${ricerca}%`;
    query = query.or(
      `email.ilike.${filtro},first_name.ilike.${filtro},last_name.ilike.${filtro}`,
    );
  }
  const { data: utenti, error } = await query;

  if (error) {
    console.error("Lettura utenti non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a caricare gli utenti.</p>;
  }

  // Acquisti degli utenti in elenco (la RLS consente agli admin di leggerli tutti).
  const acquistiPerUtente = new Map<string, RigaAcquisto[]>();
  if (utenti.length > 0) {
    const { data: acquisti, error: erroreAcquisti } = await supabase
      .from("purchases")
      .select("id, user_id, product, status, amount_total, currency, stripe_payment_intent_id, paid_at, created_at")
      .in("user_id", utenti.map((u) => u.id))
      .neq("status", "in_attesa")
      .order("created_at", { ascending: false });
    if (erroreAcquisti) console.error("Lettura acquisti non riuscita", erroreAcquisti);
    for (const { user_id, ...acquisto } of acquisti ?? []) {
      if (!user_id) continue;
      acquistiPerUtente.set(user_id, [...(acquistiPerUtente.get(user_id) ?? []), acquisto]);
    }
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

      <p className="text-sm text-muted-foreground">
        {ricerca ? (
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
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Utente</th>
                <th scope="col" className="px-4 py-3 font-medium">Registrato</th>
                <th scope="col" className="px-4 py-3 font-medium">Guida</th>
                <th scope="col" className="px-4 py-3 font-medium">Acquisti</th>
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
  urlPagamentiStripe,
}: {
  utente: Pick<
    Profilo,
    "id" | "email" | "first_name" | "last_name" | "role" | "is_blocked" | "guide_access" | "created_at"
  >;
  seiTu: boolean;
  acquisti: RigaAcquisto[];
  urlPagamentiStripe: string;
}) {
  const nomeCompleto = [utente.first_name, utente.last_name].filter(Boolean).join(" ");
  return (
    <tr className={utente.is_blocked ? "bg-muted/40" : undefined}>
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
        <div className="flex flex-wrap gap-1">
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
