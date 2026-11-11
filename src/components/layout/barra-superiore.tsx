"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon, LogOutIcon } from "lucide-react";

import { aree, isVoceAttiva, type Area } from "@/components/layout/nav-items";
import { SelettoreTema } from "@/components/tema/selettore-tema";
import { Button } from "@/components/ui/button";
import { PERCORSO_ESCI } from "@/lib/auth/percorsi";

/** Barra in alto: titolo della sezione corrente, selettore del tema e uscita. */
export function BarraSuperiore({ area }: { area: Area }) {
  const pathname = usePathname();
  const { voci, radice, nome } = aree[area];
  const voceAttiva = voci.find((v) => isVoceAttiva(pathname, v.href, radice));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {/* Su smartphone la sidebar non c'è: il marchio sta qui. */}
        <Link
          href={radice}
          aria-label="Vendere casa da privato — inizio"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden"
        >
          <HouseIcon className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{nome}</p>
          <p className="truncate font-semibold">
            {voceAttiva?.titolo ?? nome}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <SelettoreTema />
        <form action={PERCORSO_ESCI} method="post">
          <Button type="submit" variant="ghost" size="icon-lg" aria-label="Esci" title="Esci">
            <LogOutIcon aria-hidden />
          </Button>
        </form>
      </div>
    </header>
  );
}
