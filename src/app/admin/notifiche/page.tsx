import type { Metadata } from "next";
import { Suspense } from "react";

import { AzioniDestinatario } from "@/app/admin/notifiche/azioni-destinatario";
import { ModuloDestinatario } from "@/app/admin/notifiche/modulo-destinatario";
import { Badge } from "@/components/ui/badge";
import { richiediAdmin } from "@/lib/auth/admin";
import { codiciEvento, eventi, isCodiceEvento, normalizzaEventi } from "@/lib/notifiche/eventi";
import { GIORNI_STORICO, inizioStorico } from "@/lib/notifiche/invia";
import { creaClientServer } from "@/lib/supabase/server";
import type { StatoNotifica } from "@/lib/supabase/tipi";

export const metadata: Metadata = {
  title: "Notifiche",
};

export default function PaginaNotifiche() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Notifiche</h1>
          <p className="max-w-2xl text-muted-foreground">
            Chi riceve via email gli eventi importanti dell&apos;app. Rispondendo a una notifica si scrive
            direttamente al cliente.
          </p>
        </div>
        <ModuloDestinatario modo="nuovo" />
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento…</p>}>
        <Destinatari />
      </Suspense>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento dello storico…</p>}>
        <Storico />
      </Suspense>
    </div>
  );
}

async function Destinatari() {
  await richiediAdmin();
  const supabase = await creaClientServer();
  const { data: destinatari, error } = await supabase
    .from("admin_notification_recipients")
    .select("*")
    .order("created_at");

  if (error) {
    console.error("Lettura dei destinatari delle notifiche non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a caricare i destinatari.</p>;
  }

  return (
    <section aria-labelledby="titolo-destinatari" className="space-y-3">
      <h2 id="titolo-destinatari" className="text-lg font-semibold">
        Destinatari
      </h2>
      {destinatari.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          Nessun destinatario: per ora le notifiche non vengono inviate a nessuno. Aggiungi almeno un indirizzo.
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {destinatari.map((d) => {
            const scelti = normalizzaEventi(d.events);
            return (
              <li key={d.id} className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.name || d.email}</p>
                    {d.name && <p className="truncate text-sm text-muted-foreground">{d.email}</p>}
                  </div>
                  {d.paused ? <Badge variant="secondary">In pausa</Badge> : <Badge variant="outline">Attivo</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {scelti.length === codiciEvento.length
                    ? "Riceve tutti gli eventi."
                    : `Riceve ${scelti.length} eventi su ${codiciEvento.length}: ${scelti.map((c) => eventi[c].etichetta.toLowerCase()).join(", ")}.`}
                </p>
                <div className="flex flex-wrap gap-2">
                  <ModuloDestinatario modo="modifica" id={d.id} email={d.email} nome={d.name} eventiScelti={scelti} />
                  <AzioniDestinatario id={d.id} email={d.email} inPausa={d.paused} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const etichetteEsito: Record<StatoNotifica, { testo: string; variante: "default" | "secondary" | "destructive" | "outline" }> = {
  in_invio: { testo: "In invio", variante: "outline" },
  inviata: { testo: "Inviata", variante: "default" },
  parziale: { testo: "Parziale", variante: "destructive" },
  non_inviata: { testo: "Non inviata", variante: "destructive" },
  nessun_destinatario: { testo: "Nessun destinatario", variante: "secondary" },
};

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

async function Storico() {
  await richiediAdmin();
  const supabase = await creaClientServer();
  const { data: righe, error } = await supabase
    .from("admin_notification_log")
    .select("id, event, subject, recipients, status, error, created_at")
    .gte("created_at", inizioStorico())
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("Lettura dello storico delle notifiche non riuscita", error);
    return <p className="text-destructive">Non siamo riusciti a caricare lo storico.</p>;
  }

  return (
    <section aria-labelledby="titolo-storico" className="space-y-3">
      <div>
        <h2 id="titolo-storico" className="text-lg font-semibold">
          Storico degli invii
        </h2>
        <p className="text-sm text-muted-foreground">Ultimi {GIORNI_STORICO} giorni (le notifiche più vecchie si cancellano da sole).</p>
      </div>
      {righe.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Nessuna notifica negli ultimi {GIORNI_STORICO} giorni.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Data</th>
                <th scope="col" className="px-4 py-3 font-medium">Evento</th>
                <th scope="col" className="px-4 py-3 font-medium">Oggetto</th>
                <th scope="col" className="px-4 py-3 font-medium">Destinatari</th>
                <th scope="col" className="px-4 py-3 font-medium">Esito</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {righe.map((riga) => {
                const esito = etichetteEsito[riga.status];
                return (
                  <tr key={riga.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatoData.format(new Date(riga.created_at))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isCodiceEvento(riga.event) ? eventi[riga.event].etichetta : riga.event === "prova" ? "Prova" : riga.event}
                    </td>
                    <td className="px-4 py-3">{riga.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {riga.recipients.length ? riga.recipients.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={esito.variante}>{esito.testo}</Badge>
                      {riga.error && (
                        <details className="mt-1 max-w-xs text-xs text-muted-foreground">
                          <summary className="cursor-pointer">Dettagli</summary>
                          <p className="mt-1 break-words whitespace-pre-line">{riga.error}</p>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
