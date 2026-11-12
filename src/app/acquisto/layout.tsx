import Link from "next/link";

/**
 * Pagine pubbliche di ritorno da Stripe per chi acquista senza account
 * (Fase 7). Chi ha fatto l'accesso torna invece su /dashboard/acquisto/….
 */
export default function LayoutAcquisto({ children }: LayoutProps<"/acquisto">) {
  return (
    <main className="flex w-full flex-1 flex-col px-4 py-10 sm:py-16">
      <Link
        href="/"
        className="mx-auto text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Vendere Casa da Privato
      </Link>
      {children}
    </main>
  );
}
