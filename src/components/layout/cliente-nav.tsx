"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  isVoceAttiva,
  navigazioneCliente,
} from "@/components/layout/nav-items";

/** Barra di navigazione inferiore (mobile) / superiore (da md in su). */
export function ClienteNav({ variante }: { variante: "basso" | "alto" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigazione principale"
      className={cn(
        variante === "basso" &&
          "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden",
        variante === "alto" && "hidden md:block"
      )}
    >
      <ul
        className={cn(
          variante === "basso" && "mx-auto grid max-w-md grid-cols-4",
          variante === "alto" && "flex items-center gap-1"
        )}
      >
        {navigazioneCliente.map((voce) => {
          const attiva = isVoceAttiva(pathname, voce.href, "/dashboard");
          const Icona = voce.icona;
          const classi = cn(
            "flex items-center text-muted-foreground transition-colors",
            variante === "basso" &&
              "flex-col justify-center gap-1 py-2.5 text-[11px] font-medium",
            variante === "alto" &&
              "gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground",
            attiva && "text-foreground",
            attiva && variante === "alto" && "bg-muted",
            voce.disabilitata && "pointer-events-none opacity-40"
          );

          return (
            <li key={voce.href}>
              {voce.disabilitata ? (
                <span className={classi} aria-disabled="true" title="Presto disponibile">
                  <Icona className="size-5 md:size-4" aria-hidden />
                  {voce.titolo}
                </span>
              ) : (
                <Link
                  href={voce.href}
                  className={classi}
                  aria-current={attiva ? "page" : undefined}
                >
                  <Icona className="size-5 md:size-4" aria-hidden />
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
