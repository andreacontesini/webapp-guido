-- =============================================================
-- Fase 9 — Notifiche agli admin
-- Destinatari delle notifiche (anche esterni all'app) con la scelta
-- degli eventi da ricevere, storico degli invii e richiesta di ricontatto del
-- cliente. Destinatari e storico sono visibili solo agli admin; lo
-- storico lo scrive solo il server (service role).
-- =============================================================

-- -------------------------------------------------------------
-- Richiesta di ricontatto dal profilo del cliente
-- -------------------------------------------------------------
alter table public.profiles
  add column contact_request_at         timestamptz,
  add column contact_request_notes      text check (char_length(contact_request_notes) <= 1000),
  add column contact_request_handled_at timestamptz;

comment on column public.profiles.contact_request_at is 'Il cliente ha chiesto di essere ricontattato da Guido (null = nessuna richiesta).';
comment on column public.profiles.contact_request_handled_at is 'Richiesta segnata come gestita da un admin (solo service role).';

-- Il cliente invia o ritira la richiesta; la segna come gestita solo l'admin (lato server).
grant update (contact_request_at, contact_request_notes) on public.profiles to authenticated;

create index profiles_contact_request_idx on public.profiles (contact_request_at)
  where contact_request_at is not null and contact_request_handled_at is null;

-- -------------------------------------------------------------
-- Destinatari delle notifiche
-- -------------------------------------------------------------
create table public.admin_notification_recipients (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique check (email = lower(email) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' and char_length(email) <= 254),
  name        text check (char_length(name) <= 80),
  paused      boolean not null default false,
  -- Codici degli eventi ricevuti (catalogo in src/lib/notifiche/eventi.ts).
  events      text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.admin_notification_recipients is 'Chi riceve le notifiche degli eventi dell''app (gestito in /admin/notifiche).';

create trigger admin_notification_recipients_updated_at
  before update on public.admin_notification_recipients
  for each row execute function public.imposta_updated_at();

alter table public.admin_notification_recipients enable row level security;

revoke all on public.admin_notification_recipients from anon, authenticated;
grant select, insert, update, delete on public.admin_notification_recipients to authenticated;

create policy "Destinatari: solo admin"
  on public.admin_notification_recipients for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- -------------------------------------------------------------
-- Storico degli invii
-- -------------------------------------------------------------
create table public.admin_notification_log (
  id             bigint generated always as identity primary key,
  event          text not null check (char_length(event) <= 40),
  -- Unica: lo stesso evento (es. webhook ripetuto) non viene notificato due volte.
  dedupe_key     text unique check (char_length(dedupe_key) <= 200),
  subject        text not null check (char_length(subject) <= 200),
  user_id        uuid references public.profiles (id) on delete set null,
  customer_email text,
  data           jsonb not null default '{}'::jsonb,
  recipients     text[] not null default '{}',
  status         text not null default 'in_invio'
                 check (status in ('in_invio', 'inviata', 'parziale', 'non_inviata', 'nessun_destinatario')),
  error          text,
  created_at     timestamptz not null default now()
);

comment on table public.admin_notification_log is 'Storico delle notifiche agli admin (ultimi 30 giorni, scritto solo dal server).';

create index admin_notification_log_created_at_idx on public.admin_notification_log (created_at desc);

alter table public.admin_notification_log enable row level security;

revoke all on public.admin_notification_log from anon, authenticated;
grant select on public.admin_notification_log to authenticated;

create policy "Storico notifiche: lettura solo admin"
  on public.admin_notification_log for select
  to authenticated
  using ((select public.is_admin()));

-- -------------------------------------------------------------
-- Destinatari iniziali: gli admin attuali, con tutti gli eventi.
-- -------------------------------------------------------------
insert into public.admin_notification_recipients (email, name, events)
select
  lower(p.email),
  nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
  array[
    'nuovo_account', 'primo_accesso', 'acquisto', 'pagamento_in_attesa', 'rimborso',
    'contestazione_aperta', 'contestazione_chiusa', 'profilo_aggiornato',
    'richiesta_ricontatto', 'richiesta_gdpr', 'problema_tecnico'
  ]
from public.profiles p
where p.role = 'admin' and not p.is_blocked
on conflict (email) do nothing;
