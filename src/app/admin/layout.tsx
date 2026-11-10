import type { Metadata } from "next";

import { AdminMenuMobile, AdminSidebar } from "@/components/layout/admin-nav";

export const metadata: Metadata = {
  title: {
    default: "Amministrazione",
    template: "%s | Amministrazione",
  },
  robots: { index: false, follow: false },
};

/**
 * Layout back office — pensato per desktop.
 * Sidebar fissa da `lg` in su; sotto, menu a scomparsa nell'header.
 * La protezione della rotta (solo `role: admin`) arriverà nella Fase 4.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 lg:px-8">
          <AdminMenuMobile />
          <span className="text-sm text-muted-foreground">
            Vendere Casa da Privato
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
