# Configurare Stripe (pagamenti)

Il codice dei pagamenti è pronto: si attiva da solo appena in `.env.local` (e su Vercel) ci sono le chiavi vere **e** il prezzo è definito. Finché le chiavi sono segnaposto, il popup "Acquista la guida" mostra il messaggio "Il pagamento online sarà attivo a breve" con il pulsante disattivato.

## Come funziona

1. L'utente apre il popup e preme **Acquista a XX €**.
2. L'azione `avviaCheckout` (`src/app/dashboard/acquisto/azioni.ts`) crea una sessione di **Stripe Checkout** con email precompilata e ricevuta automatica, poi porta l'utente sulla pagina di pagamento di Stripe. I dati della carta non passano mai dall'app.
3. A pagamento riuscito Stripe chiama il webhook `/api/webhooks/stripe`, che:
   - verifica la firma (`STRIPE_WEBHOOK_SECRET`);
   - registra l'acquisto in `purchases`. La sessione di checkout è unica, quindi un evento ricevuto due volte non crea un secondo acquisto;
   - sblocca `guide_access` sul profilo;
   - invia l'email di conferma (Resend), una sola volta per acquisto.
4. Rimborsi e contestazioni (eventi `charge.*`): rimborso totale → acquisto `rimborsato`; contestazione aperta → `contestato`; contestazione vinta → di nuovo `pagato`. Dopo ogni cambio l'accesso alla guida resta solo se l'utente ha ancora un acquisto della guida pagato. I rimborsi parziali non revocano l'accesso.
5. L'utente torna su `/dashboard/acquisto/conferma`, che attende lo sblocco e mostra la conferma.

## 1. Prezzo

Il prezzo sta nel codice, in `src/lib/prodotti.ts` (`prezzo`, in euro IVA inclusa). Il checkout crea la riga di prodotto con nome e descrizione della guida, quindi **non serve creare prodotto e prezzo a mano nel pannello Stripe**. Per cambiare il prezzo basta modificare il valore e fare un nuovo deploy.

## 2. Chiavi API

Nel pannello Stripe del cliente, in **Sviluppatori → Chiavi API** (in modalità Test durante le prove):

| Variabile | Valore |
|---|---|
| `STRIPE_SECRET_KEY` | chiave segreta `sk_test_…` (poi `sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | chiave pubblicabile `pk_test_…` (al momento non usata dal codice) |
| `STRIPE_WEBHOOK_SECRET` | segreto del webhook `whsec_…` (passo 3) |

Le chiavi vanno in `.env.local` e in Vercel → *Settings → Environment Variables*, poi serve un nuovo deploy.

## 3. Webhook

**Sviluppatori → Webhook → Aggiungi endpoint**:

- URL: `https://app.guidocontesini.it/api/webhooks/stripe`
- Eventi: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`
- Copia il *Signing secret* in `STRIPE_WEBHOOK_SECRET`.

### In locale con la Stripe CLI

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

`stripe listen` stampa un segreto `whsec_…` da mettere in `.env.local` (diverso da quello di produzione). Carta di prova: `4242 4242 4242 4242`, qualsiasi data futura e CVC.

## 4. Aspetto della pagina di pagamento

**Impostazioni → Branding** (vale per Checkout, ricevute e fatture):

| Impostazione | Valore |
|---|---|
| Icona / Logo | `public/email/logo.png` (casa bianca su quadrato blu) |
| Colore del brand | `#2b5bd7` |
| Colore d'accento | `#0f1e33` |
| Font | sans-serif di sistema (il più vicino a Geist tra quelli offerti) |
| Forma | angoli arrotondati (circa 8 px) |

In **Impostazioni → Dati pubblici dell'attività** imposta il nome visibile (es. "Guido Contesini – Vendere Casa da Privato") e l'email di assistenza `contesiniconsulenze@gmail.com`.

## 5. Ricevute

**Impostazioni → Email ai clienti**: attiva *Pagamenti riusciti*. In modalità Test Stripe non invia le ricevute, che partono solo in Live. La ricevuta Stripe non è una fattura: vedi la Fase 12 del TODO.
