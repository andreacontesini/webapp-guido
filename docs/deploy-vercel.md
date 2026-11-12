# Pubblicare il progetto su Vercel

Obiettivo: app online su `app.guidocontesini.it`, con un nuovo deploy automatico a ogni push su `main`.

## 1. Portare il codice su GitHub

Vercel pubblica a partire dalla repo GitHub (`andreacontesini/webapp-guido`), quindi i commit locali devono essere pushati:

```bash
git push origin main
```

## 2. Importare il progetto su Vercel

1. Accedi a [vercel.com](https://vercel.com) con il tuo account GitHub.
2. **Add New… → Project**, poi scegli la repo `webapp-guido` (se non compare, clicca *Adjust GitHub App Permissions* e dai accesso alla repo).
3. Vercel riconosce Next.js da solo: lascia invariati *Framework Preset*, *Build Command* e *Output Directory*.
4. Apri **Environment Variables** e aggiungi le variabili prima del primo deploy (vedi sotto).
5. Clicca **Deploy**. Dopo circa un minuto l'app è raggiungibile su un indirizzo `*.vercel.app`.

## 3. Variabili d'ambiente

Sono le stesse di `.env.local` (l'elenco completo è in `.env.example`). Vanno inserite a mano su Vercel, perché `.env.local` non viene mai caricato su GitHub.

| Variabile | Valore in produzione |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://app.guidocontesini.it` (non `localhost`) |
| `NEXT_PUBLIC_LANDING_URL` | facoltativa: indirizzo delle landing di vendita se diverso da quello dell'app (oggi non serve) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dal progetto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | solo server: non deve mai avere il prefisso `NEXT_PUBLIC_` |
| `RESEND_API_KEY`, `EMAIL_FROM` | da Resend |
| `STRIPE_*` | per ora le chiavi **di test**; le live si inseriscono al lancio (Fase 10) |
| `BUNNY_*` | da Bunny.net |

Note:
- Le variabili si impostano in **Settings → Environment Variables**, scegliendo gli ambienti (*Production*, *Preview*, *Development*). Per *Preview* conviene usare chiavi di test.
- Le variabili `NEXT_PUBLIC_*` vengono inserite nel codice al momento della build: dopo averne modificata una serve un nuovo deploy (**Deployments → … → Redeploy**).
- Si può anche usare la CLI (`npm i -g vercel`, poi `vercel link` e `vercel env pull` per scaricarle in locale).

## 4. Collegare il dominio `app.guidocontesini.it`

1. Su Vercel: **Settings → Domains → Add**, inserisci `app.guidocontesini.it`.
2. Vercel mostra il record DNS da creare. Per un sottodominio è un **CNAME**:
   - Nome/Host: `app`
   - Valore: quello indicato da Vercel (es. `cname.vercel-dns.com` o un valore specifico del progetto)
3. Crea il record nel pannello DNS del provider di `guidocontesini.it` e non modificare gli altri record del dominio, così il sito principale e le email continuano a funzionare.
4. La propagazione richiede da pochi minuti a qualche ora. Quando Vercel mostra *Valid Configuration*, il certificato HTTPS viene generato da solo.

## 5. Dopo il primo deploy

- **Deploy automatici:** ogni push su `main` va in produzione; ogni altro branch o pull request genera un'anteprima con un URL dedicato.
- **Supabase (dalla Fase 2):** in *Authentication → URL Configuration* imposta *Site URL* a `https://app.guidocontesini.it` e aggiungi gli URL di redirect, altrimenti i Magic Link riportano a `localhost`.
- **Stripe (Fase 9):** il webhook di produzione punterà a `https://app.guidocontesini.it/api/webhooks/stripe`.
- **Resend:** per inviare da `@guidocontesini.it` va verificato il dominio su Resend (record DNS SPF/DKIM).
