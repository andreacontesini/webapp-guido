import type { Metadata } from "next";

import { MenuMobile } from "@/components/layout/menu-mobile";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: {
    default: "Amministrazione",
    template: "%s | Amministrazione",
  },
  robots: { index: false, follow: false },
};

const ETICHETTA_NAV = "Navigazione amministrazione";

/**
 * Layout back office — pensato per desktop.
 * Sidebar antracite fissa da `lg` in su; sotto, menu a scomparsa.
 * La protezione della rotta (solo `role: admin`) arriverà nella Fase 4.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar
        area="admin"
        sottotitolo="Amministrazione"
        etichettaNav={ETICHETTA_NAV}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-sidebar px-2 lg:hidden">
          <MenuMobile
            area="admin"
            sottotitolo="Amministrazione"
            etichettaNav={ETICHETTA_NAV}
          />
          <span className="font-bold text-white">Amministrazione</span>
        </header>

        <main className="w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-14">
          {children}
        </main>
      </div>
    </div>
  );
}
