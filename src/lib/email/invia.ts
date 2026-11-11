import "server-only";

import { render, toPlainText } from "@react-email/render";
import { Resend } from "resend";

/**
 * Invio delle email dell'app con Resend (le email di accesso le manda
 * invece Supabase Auth, via SMTP Resend, con i modelli di `supabase/templates/`).
 */
let client: Resend | null = null;

function resend() {
  const chiave = process.env.RESEND_API_KEY;
  if (!chiave) throw new Error("RESEND_API_KEY mancante");
  client ??= new Resend(chiave);
  return client;
}

type Invio = {
  a: string;
  oggetto: string;
  email: React.ReactElement;
  /** Evita doppi invii se la stessa operazione viene ripetuta (es. webhook duplicato). */
  chiaveIdempotenza?: string;
};

export async function inviaEmail({ a, oggetto, email, chiaveIdempotenza }: Invio) {
  const mittente = process.env.EMAIL_FROM;
  if (!mittente) throw new Error("EMAIL_FROM mancante");

  const html = await render(email);
  const { data, error } = await resend().emails.send(
    {
      from: `Guido Contesini <${mittente}>`,
      to: a,
      subject: oggetto,
      html,
      text: toPlainText(html),
    },
    chiaveIdempotenza ? { idempotencyKey: chiaveIdempotenza } : undefined,
  );

  if (error) throw new Error(`Invio email non riuscito: ${error.message}`);
  return data;
}
