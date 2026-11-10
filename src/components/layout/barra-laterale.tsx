"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { aree, isVoceAttiva, type Area } from "@/components/layout/nav-items";

/** Sidebar stretta a icone (da `lg` in su): icona con etichetta sotto. */
export function BarraLaterale({ area }: { area: Area }) {
  const pathname = usePathname();
  const { voci, radice, etichettaNav } = aree[area];

  return (
    <aside className="sticky top-0 hidden h-dvh w-22 shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar py-4 lg:flex">
      <Link
        href={radice}
        aria-label="Vendere casa da privato — inizio"
        className="mb-8 inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none"
      >
        <HouseIcon className="size-5" aria-hidden />
      </Link>

      <nav aria-label={etichettaNav} className="w-full px-2">
        <ul className="flex flex-col gap-1">
          {voci.map((voce) => {
            const attiva = isVoceAttiva(pathname, voce.href, radice);
            const Icona = voce.icona;

            const contenuto = (
              <>
                <span
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-lg transition-colors",
                    attiva
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "group-hover:bg-muted group-hover:text-foreground"
                  )}
                >
                  <Icona className="size-5" aria-hidden />
                </span>
                <span
                  className={cn(
                    "text-xs",
                    attiva ? "font-medium text-foreground" : "text-sidebar-foreground"
                  )}
                >
                  {voce.titolo}
                </span>
              </>
            );

            const classi =
              "group flex w-full flex-col items-center gap-1 rounded-lg py-1.5 text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none";

            return (
              <li key={voce.href}>
                {voce.disabilitata ? (
                  <span
                    aria-disabled="true"
                    title={`${voce.titolo}: in arrivo`}
                    className={cn(classi, "cursor-default opacity-40")}
                  >
                    {contenuto}
                  </span>
                ) : (
                  <Link
                    href={voce.href}
                    aria-current={attiva ? "page" : undefined}
                    className={classi}
                  >
                    {contenuto}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
