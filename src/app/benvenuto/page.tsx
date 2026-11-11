import type { Metadata } from "next";
import { Suspense } from "react";

import { ModuloBenvenuto } from "@/app/benvenuto/modulo-benvenuto";
import { leggiProfiloCorrente } from "@/lib/auth/utente";

export const metadata: Metadata = {
  title: "Benvenuto",
  robots: { index: false, follow: false },
};

/** Primo accesso: dati di base del profilo. Il proxy porta qui i nuovi utenti. */
export default function PaginaBenvenuto() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Vendere Casa da Privato
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Benvenuto!</h1>
        <p className="text-muted-foreground">
          Prima di iniziare ci servono solo pochi dati. Potrai completare il
          resto quando vuoi dal tuo profilo.
        </p>
        <Suspense fallback={null}>
          <EmailAccount />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <ModuloPrecompilato />
      </Suspense>
    </main>
  );
}

async function EmailAccount() {
  const { email } = await leggiProfiloCorrente();
  return (
    <p className="text-sm text-muted-foreground">
      Account: <span className="font-medium text-foreground">{email}</span>
    </p>
  );
}

/** Il modulo parte dai dati già presenti (es. inseriti dall'admin creando l'account). */
async function ModuloPrecompilato() {
  const profilo = await leggiProfiloCorrente();
  return (
    <ModuloBenvenuto
      iniziali={{
        nome: profilo.first_name ?? "",
        cognome: profilo.last_name ?? "",
        telefono: profilo.phone ?? "",
        marketing: profilo.marketing_consent,
      }}
    />
  );
}
