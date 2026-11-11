/**
 * Sfondo decorativo della pagina iniziale (alone blu e griglia leggera che
 * sfuma verso i bordi). Va dentro un contenitore `relative isolate`.
 */
export function SfondoHero() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl lg:left-[70%]" />
      <div
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "3.5rem 3.5rem",
        }}
      />
    </div>
  );
}
