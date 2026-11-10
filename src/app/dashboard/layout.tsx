import Link from "next/link";

import { BarraInferiore } from "@/components/layout/barra-inferiore";
import { Sidebar } from "@/components/layout/sidebar";

const ETICHETTA_NAV = "Navigazione principale";

/**
 * Layout area riservata cliente — mobile-first.
 * Sotto `lg`: barra superiore antracite + navigazione fissa in basso.
 * Da `lg` in su: sidebar antracite fissa a sinistra.
 */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar
        area="cliente"
        sottotitolo="con Guido Contesini"
        etichettaNav={ETICHETTA_NAV}
        piede={<p>Versione beta</p>}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center bg-sidebar px-4 lg:hidden">
          <Link
            href="/dashboard"
            className="text-[1.0625rem] font-bold tracking-[-0.01em] text-white"
          >
            Vendere casa{" "}
            <span className="text-sidebar-primary">da privato</span>
          </Link>
        </header>

        <main className="w-full max-w-4xl flex-1 px-5 pt-8 pb-28 sm:px-8 lg:px-12 lg:pt-14 lg:pb-14">
          {children}
        </main>
      </div>

      <BarraInferiore
        area="cliente"
        etichettaNav={ETICHETTA_NAV}
      />
    </div>
  );
}
