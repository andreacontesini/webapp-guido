"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isVoceAttiva, navigazioneAdmin } from "@/components/layout/nav-items";

function VociAdmin({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigazione amministrazione">
      <ul className="space-y-1">
        {navigazioneAdmin.map((voce) => {
          const attiva = isVoceAttiva(pathname, voce.href, "/admin");
          const Icona = voce.icona;
          const classi = cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            attiva && "bg-sidebar-accent text-sidebar-accent-foreground",
            voce.disabilitata && "pointer-events-none opacity-40"
          );

          return (
            <li key={voce.href}>
              {voce.disabilitata ? (
                <span className={classi} aria-disabled="true" title="Presto disponibile">
                  <Icona className="size-4" aria-hidden />
                  {voce.titolo}
                </span>
              ) : (
                <Link
                  href={voce.href}
                  className={classi}
                  aria-current={attiva ? "page" : undefined}
                  onClick={onNavigate}
                >
                  <Icona className="size-4" aria-hidden />
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

/** Sidebar fissa, visibile da `lg` in su. */
export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b px-5">
        <Link href="/admin" className="font-semibold tracking-tight">
          Amministrazione
        </Link>
      </div>
      <div className="flex-1 p-3">
        <VociAdmin />
      </div>
    </aside>
  );
}

/** Menu a scomparsa per schermi piccoli. */
export function AdminMenuMobile() {
  const [aperto, setAperto] = useState(false);

  return (
    <Sheet open={aperto} onOpenChange={setAperto}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden" />
        }
      >
        <MenuIcon />
        <span className="sr-only">Apri menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Amministrazione</SheetTitle>
        </SheetHeader>
        <div className="p-3">
          <VociAdmin onNavigate={() => setAperto(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
