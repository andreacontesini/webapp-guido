import { isIdLanding, registraEventoLanding } from "@/lib/landing/eventi";

/** Crawler e strumenti automatici: le loro visite non contano. */
const robot = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse|headless/i;

/**
 * Visita di una landing, inviata dalla pagina con `navigator.sendBeacon`.
 * Anonima: si salva solo l'id della landing (vedi `src/lib/landing/eventi.ts`).
 */
export async function POST(request: Request) {
  if (robot.test(request.headers.get("user-agent") ?? "")) {
    return new Response(null, { status: 204 });
  }

  let landing: unknown;
  try {
    ({ landing } = (await request.json()) as { landing?: unknown });
  } catch {
    return new Response("Richiesta non valida", { status: 400 });
  }
  if (!isIdLanding(landing)) return new Response("Richiesta non valida", { status: 400 });

  await registraEventoLanding(landing, "visita");
  return new Response(null, { status: 204 });
}
