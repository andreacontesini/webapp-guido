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
  /** Indirizzo per il "Rispondi a" (es. l'email del cliente nelle notifiche agli admin). */
  rispondiA?: string;
  /** Evita doppi invii se la stessa operazione viene ripetuta (es. webhook duplicato). */
  chiaveIdempotenza?: string;
};

export async function inviaEmail({ a, oggetto, email, rispondiA, chiaveIdempotenza }: Invio) {
  const mittente = process.env.EMAIL_FROM;
  if (!mittente) throw new Error("EMAIL_FROM mancante");

  const html = await render(email);
  const { data, error } = await resend().emails.send(
    {
      // Già nel formato "Nome <indirizzo>" (vedi .env.example).
      from: mittente,
      to: a,
      subject: oggetto,
      html,
      text: toPlainText(html),
      ...(rispondiA ? { replyTo: rispondiA } : {}),
    },
    chiaveIdempotenza ? { idempotencyKey: chiaveIdempotenza } : undefined,
  );

  if (error) throw new Error(`Invio email non riuscito: ${error.message}`);
  return data;
}
