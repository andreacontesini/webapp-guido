import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { etichettaValore, sezioni } from "@/lib/profilo/campi";
import { calcolaCompletamento } from "@/lib/profilo/completamento";
import type { Immobile, Profilo } from "@/lib/supabase/tipi";

const formatoData = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" });

/**
 * Profilo del cliente nella tabella admin: percentuale di completamento e,
 * al clic, tutti i dati in sola lettura (via e note comprese) con il
 * pulsante per scaricare la scheda cliente in PDF.
 */
export function ProfiloUtente({ profilo, immobile }: { profilo: Profilo; immobile: Immobile | null }) {
  const { percentuale } = calcolaCompletamento(profilo, immobile);
  const nome = [profilo.first_name, profilo.last_name].filter(Boolean).join(" ") || profilo.email;

  const account = [
    { etichetta: "Email", valore: profilo.email },
    {
      etichetta: "Privacy accettata",
      valore: profilo.privacy_accepted_at ? formatoData.format(new Date(profilo.privacy_accepted_at)) : null,
    },
    { etichetta: "Comunicazioni promozionali", valore: profilo.marketing_consent ? "Sì" : "No" },
  ];

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="-ml-2 h-auto px-2 py-1 tabular-nums" />}>
        {percentuale}%
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{nome}</DialogTitle>
          <DialogDescription>Profilo completo al {percentuale}%</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Gruppo titolo="Account" righe={account} />
          {sezioni.map((sezione) => {
            const origine = (sezione.tabella === "profiles" ? profilo : (immobile ?? {})) as Record<string, unknown>;
            return (
              <Gruppo
                key={sezione.id}
                titolo={sezione.titolo}
                righe={sezione.campi.map((campo) => ({
                  etichetta: campo.etichetta,
                  valore: etichettaValore(campo, origine[campo.nome]),
                }))}
              />
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button render={<a href={`/admin/utenti/${profilo.id}/scheda.pdf`} />} nativeButton={false}>
            <DownloadIcon aria-hidden />
            Scarica scheda cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Gruppo({ titolo, righe }: { titolo: string; righe: { etichetta: string; valore: string | null }[] }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{titolo}</h3>
      <dl className="divide-y rounded-lg border text-sm">
        {righe.map(({ etichetta, valore }) => (
          <div key={etichetta} className="grid gap-1 px-3 py-2 sm:grid-cols-[14rem_1fr] sm:gap-3">
            <dt className="text-muted-foreground">{etichetta}</dt>
            <dd className={valore ? "whitespace-pre-line" : "text-muted-foreground"}>{valore ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
