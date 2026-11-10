"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon } from "lucide-react";

import { aree, isVoceAttiva, type Area } from "@/components/layout/nav-items";
import { SelettoreTema } from "@/components/tema/selettore-tema";

/** Barra in alto: titolo della sezione corrente e selettore del tema. */
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
      <SelettoreTema />
    </header>
  );
}
