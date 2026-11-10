import Link from "next/link";

import { ClienteNav } from "@/components/layout/cliente-nav";

/**
 * Layout area riservata cliente — mobile-first.
 * Su smartphone: header compatto + navigazione fissa in basso.
 * Da `md` in su: navigazione nell'header e contenuto centrato.
 */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Vendere Casa da Privato
          </Link>
          <ClienteNav variante="alto" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-10">
        {children}
      </main>

      <ClienteNav variante="basso" />
    </div>
  );
}
