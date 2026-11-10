import { GuscioApp } from "@/components/layout/guscio-app";

/** Layout area riservata cliente (mobile-first). */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <GuscioApp area="cliente">{children}</GuscioApp>;
}
