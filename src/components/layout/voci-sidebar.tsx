"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { aree, isVoceAttiva, type Area } from "@/components/layout/nav-items";

type Props = {
  area: Area;
  onNavigate?: () => void;
};

/** Elenco verticale delle voci, usato sia nella sidebar fissa sia nel menu mobile. */
export function VociSidebar({ area, onNavigate }: Props) {
  const pathname = usePathname();
  const { voci, radice } = aree[area];

  return (
    <ul className="space-y-0.5">
      {voci.map((voce) => {
        const attiva = isVoceAttiva(pathname, voce.href, radice);
        const Icona = voce.icona;
        const classi = cn(
          "relative flex items-center gap-3 rounded-md py-2.5 pr-3 pl-4 text-[0.9375rem] transition-colors",
          "before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-transparent before:transition-colors",
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
          attiva &&
            "bg-sidebar-accent font-medium text-sidebar-accent-foreground before:bg-sidebar-primary"
        );

        if (voce.disabilitata) {
          return (
            <li key={voce.href}>
              <span
                aria-disabled="true"
                className={cn(classi, "pointer-events-none opacity-45")}
              >
                <Icona className="size-[1.125rem]" aria-hidden />
                <span className="flex-1">{voce.titolo}</span>
                <span className="text-xs font-normal">In arrivo</span>
              </span>
            </li>
          );
        }

        return (
          <li key={voce.href}>
            <Link
              href={voce.href}
              className={classi}
              aria-current={attiva ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icona
                className={cn(
                  "size-[1.125rem]",
                  attiva && "text-sidebar-primary"
                )}
                aria-hidden
              />
              {voce.titolo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
