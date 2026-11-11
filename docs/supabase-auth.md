# Configurare Supabase (database e Magic Link)

Passi da fare una volta sola nel progetto Supabase del cliente. Senza questi passi l'accesso non funziona.

## 1. Chiavi in `.env.local` e su Vercel

Da **Project Settings → API** copia:

| Variabile | Dove la trovi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | *Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chiave *anon* / *publishable* |
| `SUPABASE_SERVICE_ROLE_KEY` | chiave *service_role* / *secret* (solo server, mai `NEXT_PUBLIC_`) |

Inseriscile in `.env.local` e, per la produzione, in Vercel → *Settings → Environment Variables*, poi fai un nuovo deploy.

## 2. Creare tabelle e policy

Apri **SQL Editor** ed esegui **in ordine** il contenuto dei file in `supabase/migrations/`:

1. `20261111100000_schema_base.sql`: tabelle `profiles` e `guide_settings`, trigger che crea il profilo alla registrazione.
2. `20261111100100_rls.sql`: Row Level Security e funzione per la sessione unica.
3. `20261111120000_ping.sql`: funzione di keep-alive per la GitHub Action.
4. `20261112090000_storage_guida.sql`: bucket privato `guida` per il PDF.
5. `20261113090000_accesso_guida.sql`: i nuovi utenti non hanno la guida finché non la assegna l'admin (o il pagamento).
6. `20261114090000_acquisti.sql`: tabella `purchases` degli acquisti Stripe (scritta solo dal webhook; ogni utente legge solo i propri).

In alternativa, con la Supabase CLI: `supabase link --project-ref <ref>` e poi `supabase db push`. Le migrazioni applicate sono registrate in `supabase_migrations.schema_migrations`, la stessa tabella usata dalla CLI.

Per rendere admin il primo utente (dopo il suo primo accesso); gli altri si gestiscono poi da **Amministrazione → Utenti**:

```sql
update public.profiles set role = 'admin' where email = 'indirizzo@esempio.it';
```

## 3. Invio email con Resend (SMTP)

1. Su Resend verifica il dominio `guidocontesini.it` (record DNS SPF/DKIM su Aruba) e crea una API key.
2. Su Supabase: **Authentication → Emails → SMTP Settings → Enable custom SMTP**:
   - Host: `smtp.resend.com`, porta `465`
   - Username: `resend`
   - Password: la API key di Resend
   - Sender email: lo stesso indirizzo di `EMAIL_FROM` (es. `accesso@guidocontesini.it`)
   - Sender name: `Guido Contesini`
3. In **Authentication → Rate Limits** alza il limite delle email orarie (quello di default è molto basso).

## 4. Modelli delle email

I modelli HTML sono in `supabase/templates/`, generati dai componenti React Email di `src/emails/` (stesso layout delle email inviate dall'app con Resend). Dopo ogni modifica a `src/emails/` rigenerali con:

```bash
npm run email:supabase
```

Per vedere le email nel browser mentre le modifichi: `npm run email:anteprima` (apre http://localhost:3001).

Poi in **Authentication → Emails → Templates** copia il contenuto di ogni file nel modello corrispondente:

| Modello Supabase | File | Oggetto |
|---|---|---|
| Magic Link | `magic-link.html` | `Il tuo link per accedere` |
| Confirm signup | `conferma-registrazione.html` | `Conferma la tua email` |
| Change Email Address | `cambio-email.html` | `Conferma il nuovo indirizzo email` |

I link puntano direttamente all'app con `token_hash` (`/auth/conferma`), quindi funzionano anche se l'email viene aperta su un altro dispositivo. Il logo è servito dall'app in `{{ .SiteURL }}/email/logo.png` (rigenerabile con `node scripts/genera-logo-email.mjs`).

## 5. URL dell'app

**Authentication → URL Configuration**:

- *Site URL*: `https://app.guidocontesini.it`
- *Redirect URLs*: `https://app.guidocontesini.it/**` e `http://localhost:3000/**`

Nota: `{{ .SiteURL }}` nel template è sempre l'URL di produzione. Per provare il login in locale, apri il link dell'email e sostituisci a mano `https://app.guidocontesini.it` con `http://localhost:3000`.

## Come funziona l'accesso

- `/accesso`: l'utente inserisce l'email e riceve il Magic Link (se l'account non esiste viene creato).
- `/auth/conferma`: verifica il link, registra la sessione come unica valida (`profiles.current_session_id`) e chiude le altre.
- `/benvenuto`: al primo accesso chiede i dati di base. Gli altri si completano dal Profilo.
- `src/proxy.ts`: a ogni pagina rinnova la sessione e fa uscire chi è bloccato o ha effettuato l'accesso da un altro dispositivo.
