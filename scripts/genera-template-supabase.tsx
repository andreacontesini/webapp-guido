/**
 * Genera i modelli HTML delle email di Supabase Auth in `supabase/templates/`
 * a partire dai componenti React Email di `src/emails/`.
 * I segnaposto `{{ .SiteURL }}`, `{{ .TokenHash }}`… sono quelli di Supabase.
 *
 * Uso: npm run email:supabase — poi copia ogni file nel pannello Supabase
 * (Authentication → Emails → Templates), vedi docs/supabase-auth.md.
 */
import { mkdirSync, writeFileSync } from "node:fs";

import { pretty, render } from "@react-email/render";

import EmailAccesso from "../src/emails/accesso";
import EmailCambioEmail from "../src/emails/cambio-email";

const SITO = "{{ .SiteURL }}";
const conferma = (tipo: string) =>
  `${SITO}/auth/conferma?token_hash={{ .TokenHash }}&type=${tipo}&next=/dashboard`;

const modelli = [
  {
    file: "magic-link.html",
    email: <EmailAccesso urlAccesso={conferma("email")} baseUrl={SITO} />,
  },
  {
    file: "conferma-registrazione.html",
    email: <EmailAccesso urlAccesso={conferma("email")} baseUrl={SITO} nuovoAccount />,
  },
  {
    file: "cambio-email.html",
    email: (
      <EmailCambioEmail
        urlConferma={conferma("email_change")}
        vecchiaEmail="{{ .Email }}"
        nuovaEmail="{{ .NewEmail }}"
        baseUrl={SITO}
      />
    ),
  },
];

async function genera() {
  mkdirSync("supabase/templates", { recursive: true });
  for (const { file, email } of modelli) {
    const html = await pretty(await render(email));
    writeFileSync(`supabase/templates/${file}`, html);
    console.log(`Creato supabase/templates/${file}`);
  }
}

genera().catch((errore) => {
  console.error(errore);
  process.exit(1);
});
