"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  aree,
  isVoceAttiva,
  type Area,
  type VoceNavigazione,
} from "@/components/layout/nav-items";

/** Navigazione fissa in basso per smartphone e tablet (sotto `lg`). */
export function BarraInferiore({
  area,
  etichettaNav,
  extra,
}: {
  area: Area;
  etichettaNav: string;
  /** Voci aggiuntive in coda (es. Amministrazione, solo per gli admin). */
  extra?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { voci, radice } = aree[area];

  return (
    <nav
      aria-label={etichettaNav}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg auto-cols-fr grid-flow-col">
        {voci.map((voce) => (
          <li key={voce.href}>
            <VoceInferiore voce={voce} attiva={isVoceAttiva(pathname, voce.href, radice)} />
          </li>
        ))}
        {extra}
      </ul>
    </nav>
  );
}

/** Singola voce della barra in basso: icona con etichetta. */
export function VoceInferiore({ voce, attiva }: { voce: VoceNavigazione; attiva: boolean }) {
  const Icona = voce.icona;
  const classi = cn(
    "-mt-px flex flex-col items-center justify-center gap-1 pt-2.5 pb-2 text-xs text-muted-foreground",
    "border-t-2 border-transparent focus-visible:bg-muted focus-visible:outline-none",
    attiva && "border-sidebar-primary font-medium text-foreground"
  );

  if (voce.disabilitata) {
    return (
      <span aria-disabled="true" className={cn(classi, "opacity-40")}>
        <Icona className="size-5" aria-hidden />
        {voce.titolo}
      </span>
    );
  }
  return (
    <Link href={voce.href} className={classi} aria-current={attiva ? "page" : undefined}>
      <Icona className={cn("size-5", attiva && "text-sidebar-primary")} aria-hidden />
      {voce.titolo}
    </Link>
  );
}
