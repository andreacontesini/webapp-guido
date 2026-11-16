import { CheckCircle2Icon, CircleIcon } from "lucide-react";

import type { Completamento } from "@/lib/profilo/completamento";

const MAX_NOMI = 3;

/** Elenco breve di cosa manca, sezione per sezione, per arrivare al 100%. */
function CampiMancanti({ sezioni }: { sezioni: Completamento["sezioni"] }) {
  const daCompletare = sezioni.filter((s) => s.mancanti.length > 0);
  return (
    <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
      <p className="font-medium">Per arrivare al 100% mancano:</p>
      <ul className="space-y-1 text-muted-foreground">
        {daCompletare.map((s) => {
          const nomi = s.mancanti.slice(0, MAX_NOMI).join(", ");
          const altri = s.mancanti.length - MAX_NOMI;
          return (
            <li key={s.id}>
              <a href={`#sezione-${s.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                {s.titolo}
              </a>
              : {nomi}
              {altri > 0 && ` e ${altri === 1 ? "un altro campo" : `altri ${altri} campi`}`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RiepilogoCompletamento({ completamento }: { completamento: Completamento }) {
  const { percentuale, sezioni } = completamento;
  return (
    <section aria-labelledby="titolo-completamento" className="rounded-xl border bg-card p-5 text-card-foreground sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titolo-completamento" className="font-semibold">Profilo completo al {percentuale}%</h2>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentuale} aria-labelledby="titolo-completamento" className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percentuale}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Più informazioni ci dai, più Guido può aiutarti in modo concreto: capire il valore della tua casa, i documenti che mancano e i tempi giusti per vendere.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {sezioni.map((s) => (
          <li key={s.id}>
            <a href={`#sezione-${s.id}`} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
              {s.completa ? <CheckCircle2Icon className="size-4 text-primary" aria-hidden /> : <CircleIcon className="size-4 text-muted-foreground" aria-hidden />}
              {s.titolo}
              <span className="sr-only">{s.completa ? "(completa)" : "(da completare)"}</span>
            </a>
          </li>
        ))}
      </ul>
      {percentuale < 100 && <CampiMancanti sezioni={sezioni} />}
    </section>
  );
}
