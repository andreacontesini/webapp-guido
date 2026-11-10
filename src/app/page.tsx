import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Guido Contesini
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Vendere Casa da Privato
        </h1>
        <p className="text-muted-foreground">
          Accedi alla tua area riservata per consultare la guida e il
          videocorso.
        </p>
      </div>
      <Button size="lg" render={<Link href="/dashboard" />} nativeButton={false}>
        Vai alla tua area
      </Button>
    </main>
  );
}
