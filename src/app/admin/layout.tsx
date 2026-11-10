import type { Metadata } from "next";

import { GuscioApp } from "@/components/layout/guscio-app";

export const metadata: Metadata = {
  title: {
    default: "Amministrazione",
    template: "%s | Amministrazione",
  },
  robots: { index: false, follow: false },
};

/**
 * Layout back office.
 * La protezione della rotta (solo `role: admin`) arriverà nella Fase 4.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <GuscioApp area="admin">{children}</GuscioApp>;
}
