import type { Metadata } from "next";
import { Suspense } from "react";
import { InfoIcon } from "lucide-react";

import { ModuloAccesso } from "@/app/accesso/modulo-accesso";
import {
  PERCORSO_INIZIALE,
  isMotivoUscita,
  motiviUscita,
  percorsoSicuro,
} from "@/lib/auth/percorsi";

export const metadata: Metadata = {
  title: "Accedi",
};

export default function PaginaAccesso({ searchParams }: PageProps<"/accesso">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Vendere Casa da Privato
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Accedi</h1>
        <p className="text-muted-foreground">
          Inserisci la tua email: ti mandiamo un link per entrare nella tua
          area riservata.
        </p>
      </div>

      {/* I parametri dell'URL si leggono solo a richiesta: il resto è statico. */}
      <Suspense fallback={<ModuloAccesso prossimo={PERCORSO_INIZIALE} />}>
        <ContenutoAccesso searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ContenutoAccesso({
  searchParams,
}: Pick<PageProps<"/accesso">, "searchParams">) {
  const { motivo, next } = await searchParams;
  const avviso = isMotivoUscita(motivo) ? motiviUscita[motivo] : null;
  const prossimo = percorsoSicuro(typeof next === "string" ? next : null);

  return (
    <>
      {avviso && (
        <p role="alert" className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          {avviso}
        </p>
      )}
      <ModuloAccesso prossimo={prossimo} />
    </>
  );
}
