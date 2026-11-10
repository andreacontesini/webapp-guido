"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { aree, isVoceAttiva, type Area } from "@/components/layout/nav-items";

/** Navigazione fissa in basso per smartphone e tablet (sotto `lg`). */
export function BarraInferiore({
  area,
  etichettaNav,
}: {
  area: Area;
  etichettaNav: string;
}) {
  const pathname = usePathname();
  const { voci, radice } = aree[area];

  return (
    <nav
      aria-label={etichettaNav}
      className="fixed inset-x-0 bottom-0 z-40 bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul
        className="mx-auto grid max-w-lg"
        style={{ gridTemplateColumns: `repeat(${voci.length}, minmax(0, 1fr))` }}
      >
        {voci.map((voce) => {
          const attiva = isVoceAttiva(pathname, voce.href, radice);
          const Icona = voce.icona;
          const classi = cn(
            "flex flex-col items-center justify-center gap-1 pt-2.5 pb-2 text-xs font-medium text-sidebar-foreground",
            "border-t-2 border-transparent focus-visible:bg-sidebar-accent focus-visible:outline-none",
            attiva && "border-sidebar-primary text-white"
          );

          return (
            <li key={voce.href}>
              {voce.disabilitata ? (
                <span
                  aria-disabled="true"
                  className={cn(classi, "opacity-40")}
                >
                  <Icona className="size-5" aria-hidden />
                  {voce.titolo}
                </span>
              ) : (
                <Link
                  href={voce.href}
                  className={classi}
                  aria-current={attiva ? "page" : undefined}
                >
                  <Icona
                    className={cn("size-5", attiva && "text-sidebar-primary")}
                    aria-hidden
                  />
                  {voce.titolo}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
