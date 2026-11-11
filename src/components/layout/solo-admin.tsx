import { leggiProfiloCorrente } from "@/lib/auth/utente";

/** Mostra il contenuto solo se l'utente corrente è admin (va dentro un Suspense). */
export async function SoloAdmin({ children }: { children: React.ReactNode }) {
  const { role } = await leggiProfiloCorrente();
  return role === "admin" ? children : null;
}
