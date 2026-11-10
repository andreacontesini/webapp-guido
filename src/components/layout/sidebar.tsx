import Link from "next/link";

import { aree, type Area } from "@/components/layout/nav-items";
import { VociSidebar } from "@/components/layout/voci-sidebar";

type MarchioProps = {
  href: string;
  /** Riga secondaria sotto il nome (es. "Amministrazione"). */
  sottotitolo: string;
};

/** Nome del prodotto su due righe: è l'elemento tipografico distintivo della sidebar. */
export function Marchio({ href, sottotitolo }: MarchioProps) {
  return (
    <Link
      href={href}
      className="group block rounded-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
    >
      <span className="block text-[1.375rem] leading-[1.05] font-bold tracking-[-0.02em] text-white">
        Vendere casa
        <br />
        <span className="text-sidebar-primary">da privato</span>
      </span>
      <span className="mt-2 block text-sm text-sidebar-foreground">
        {sottotitolo}
      </span>
    </Link>
  );
}

type SidebarProps = {
  area: Area;
  sottotitolo: string;
  etichettaNav: string;
  piede?: React.ReactNode;
};

/** Sidebar antracite fissa, visibile da `lg` in su. */
export function Sidebar({
  area,
  sottotitolo,
  etichettaNav,
  piede,
}: SidebarProps) {
  const { radice } = aree[area];
  return (
    <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="px-6 pt-8 pb-10">
        <Marchio href={radice} sottotitolo={sottotitolo} />
      </div>
      <nav aria-label={etichettaNav} className="flex-1 px-3">
        <VociSidebar area={area} />
      </nav>
      {piede ? (
        <div className="border-t border-sidebar-border px-6 py-5 text-sm">
          {piede}
        </div>
      ) : null}
    </aside>
  );
}
