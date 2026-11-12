import { CheckCircle2Icon, CircleIcon } from "lucide-react";

import type { Completamento } from "@/lib/profilo/completamento";

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
    </section>
  );
}
