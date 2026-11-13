import type { Metadata } from "next";
import { Suspense } from "react";

import { DatiAccount } from "@/app/dashboard/profilo/dati-account";
import { RichiestaRicontatto } from "@/app/dashboard/profilo/richiesta-ricontatto";
import { RiepilogoCompletamento } from "@/app/dashboard/profilo/riepilogo-completamento";
import { SezioneProfilo } from "@/app/dashboard/profilo/sezione-profilo";
import { sezioni } from "@/lib/profilo/campi";
import { calcolaCompletamento, valoriSezione } from "@/lib/profilo/completamento";
import { leggiProfiloCompleto } from "@/lib/profilo/dati";
import { statoRichiesta } from "@/lib/profilo/ricontatto";

export const metadata: Metadata = { title: "Profilo" };

export default function PaginaProfilo() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Il tuo profilo</h1>
        <p className="text-muted-foreground">Compila le sezioni quando vuoi: ognuna si salva da sola.</p>
      </header>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento…</p>}>
        <Contenuto />
      </Suspense>
    </div>
  );
}

async function Contenuto() {
  const { profilo, immobile } = await leggiProfiloCompleto();
  const completamento = calcolaCompletamento(profilo, immobile);
  const richiesta = statoRichiesta(profilo);
  return (
    <>
      <RiepilogoCompletamento completamento={completamento} />
      <RichiestaRicontatto
        stato={richiesta}
        data={richiesta === "gestita" ? profilo.contact_request_handled_at : profilo.contact_request_at}
        iniziali={{
          note: richiesta === "in_attesa" ? (profilo.contact_request_notes ?? "") : "",
          contatto: profilo.contact_preference ?? "",
          orario: profilo.contact_time ?? "",
          telefono: profilo.phone ?? "",
        }}
      />
      <p className="text-sm text-muted-foreground">
        Email dell&apos;account: <span className="font-medium text-foreground">{profilo.email}</span> (non modificabile) · Comunicazioni promozionali: {profilo.marketing_consent ? "sì" : "no"}
      </p>
      {sezioni.map((sezione) => (
        <SezioneProfilo
          key={sezione.id}
          idSezione={sezione.id}
          iniziali={valoriSezione(sezione, profilo, immobile)}
          completa={completamento.sezioni.find((s) => s.id === sezione.id)?.completa ?? false}
        />
      ))}
      <DatiAccount admin={profilo.role === "admin"} />
    </>
  );
}
