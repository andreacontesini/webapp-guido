"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { aree, type Area } from "@/components/layout/nav-items";
import { Marchio } from "@/components/layout/sidebar";
import { VociSidebar } from "@/components/layout/voci-sidebar";

/** Menu a scomparsa con le stesse voci della sidebar, per schermi sotto `lg`. */
export function MenuMobile({
  area,
  sottotitolo,
  etichettaNav,
}: {
  area: Area;
  sottotitolo: string;
  etichettaNav: string;
}) {
  const { radice } = aree[area];
  const [aperto, setAperto] = useState(false);

  return (
    <Sheet open={aperto} onOpenChange={setAperto}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-sidebar-accent hover:text-white lg:hidden"
          />
        }
      >
        <MenuIcon />
        <span className="sr-only">Apri menu</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetTitle className="sr-only">{etichettaNav}</SheetTitle>
        <div className="px-6 pt-8 pb-8" onClick={() => setAperto(false)}>
          <Marchio href={radice} sottotitolo={sottotitolo} />
        </div>
        <nav aria-label={etichettaNav} className="px-3">
          <VociSidebar area={area} onNavigate={() => setAperto(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
