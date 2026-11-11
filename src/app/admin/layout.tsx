import type { Metadata } from "next";
import { Suspense } from "react";

import { GuscioApp } from "@/components/layout/guscio-app";
import { richiediAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: {
    default: "Amministrazione",
    template: "%s | Amministrazione",
  },
  robots: { index: false, follow: false },
};

/**
 * Layout back office, riservato a `role: admin`.
 * Il proxy blocca già la rotta; qui ripetiamo il controllo lato server
 * prima di mostrare qualsiasi contenuto (difesa in profondità).
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <GuscioApp area="admin">
      <Suspense fallback={<p className="text-muted-foreground">Caricamento…</p>}>
        <SoloAdmin>{children}</SoloAdmin>
      </Suspense>
    </GuscioApp>
  );
}

async function SoloAdmin({ children }: { children: React.ReactNode }) {
  await richiediAdmin();
  return children;
}
