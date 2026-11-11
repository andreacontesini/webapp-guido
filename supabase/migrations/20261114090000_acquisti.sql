-- =============================================================
-- Fase 5 — Acquisti (purchases)
-- Una riga per ogni pagamento Stripe Checkout. Le righe vengono
-- scritte solo dal webhook Stripe lato server (service role): gli
-- utenti possono soltanto leggere i propri acquisti, l'admin tutti.
-- =============================================================

create type public.stato_acquisto as enum (
  'in_attesa',   -- sessione di checkout creata, pagamento non ancora confermato
  'pagato',      -- pagamento confermato: accesso sbloccato
  'rimborsato',  -- rimborso emesso: accesso revocato (Fase 6)
  'contestato'   -- contestazione/chargeback aperta: accesso revocato (Fase 6)
);

create table public.purchases (
  id                         uuid primary key default gen_random_uuid(),
  -- Null se l'account viene eliminato: l'acquisto resta per lo storico contabile.
  user_id                    uuid references public.profiles (id) on delete set null,
  -- Email dell'acquirente al momento dell'acquisto (anche dopo l'eliminazione dell'account).
  email                      text not null,
  -- Codice prodotto, come in `src/lib/prodotti.ts`.
  product                    text not null check (product in ('guida', 'videocorso')),
  status                     public.stato_acquisto not null default 'in_attesa',
  -- Importo in centesimi, come restituito da Stripe.
  amount_total               integer check (amount_total >= 0),
  currency                   text not null default 'eur',
  -- Unico: rende idempotente la gestione degli eventi duplicati del webhook.
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text unique,
  paid_at                    timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

comment on table public.purchases is 'Acquisti tramite Stripe Checkout: scritti solo dal webhook (service role).';
comment on column public.purchases.amount_total is 'Importo totale in centesimi.';

create index purchases_user_id_idx on public.purchases (user_id);

create trigger purchases_updated_at
  before update on public.purchases
  for each row execute function public.imposta_updated_at();

-- -------------------------------------------------------------
-- RLS: lettura dei propri acquisti (o di tutti per l'admin).
-- Nessuna policy di scrittura: insert/update/delete solo service role.
-- -------------------------------------------------------------
alter table public.purchases enable row level security;

revoke all on public.purchases from anon, authenticated;
grant select on public.purchases to authenticated;

create policy "Lettura dei propri acquisti o admin"
  on public.purchases for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
