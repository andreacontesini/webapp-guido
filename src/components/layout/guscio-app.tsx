import { BarraInferiore } from "@/components/layout/barra-inferiore";
import { BarraLaterale } from "@/components/layout/barra-laterale";
import { BarraSuperiore } from "@/components/layout/barra-superiore";
import { aree, type Area } from "@/components/layout/nav-items";

/**
 * Struttura comune di area cliente e admin.
 * Da `lg` in su: sidebar a icone + barra superiore.
 * Sotto `lg`: barra superiore + navigazione fissa in basso (mobile-first).
 */
export function GuscioApp({
  area,
  children,
}: {
  area: Area;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <BarraLaterale area={area} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperiore area={area} />
        <main className="w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10">
          {children}
        </main>
      </div>
      <BarraInferiore area={area} etichettaNav={aree[area].etichettaNav} />
    </div>
  );
}
