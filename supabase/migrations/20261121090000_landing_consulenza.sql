-- =============================================================
-- Landing della consulenza (v0.12.0)
-- 1. Barra fissa su smartphone configurabile per landing.
-- 2. Richieste dai moduli di contatto delle landing.
-- 3. Statistiche: nuovo evento "contatto" e conteggio delle richieste.
-- 4. Bucket delle landing: anche video MP4/WebM (max 10 MB).
-- 5. Notifiche: nuovo evento "richiesta_landing" per i destinatari esistenti.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Barra fissa su smartphone: { attiva, titolo, testo, pulsante }.
-- null = comportamento precedente (barra di acquisto se la landing vende la guida).
-- -------------------------------------------------------------
alter table public.landing_pages
  add column mobile_bar jsonb check (mobile_bar is null or jsonb_typeof(mobile_bar) = 'object');

comment on column public.landing_pages.mobile_bar is
  'Barra fissa in basso su smartphone (attiva, titolo, testo, pulsante); null = barra di acquisto predefinita.';

-- -------------------------------------------------------------
-- 2. Richieste dai moduli di contatto.
-- Scritte solo dal server (service role) dopo i controlli anti-spam;
-- lette, segnate come gestite ed eliminate solo dagli admin.
-- -------------------------------------------------------------
create table public.landing_requests (
  id             uuid primary key default gen_random_uuid(),
  landing_id     uuid references public.landing_pages (id) on delete set null,
  -- Nome della landing al momento dell'invio (resta anche se la landing viene eliminata).
  landing_title  text not null check (char_length(landing_title) <= 120),
  block_id       text not null check (char_length(block_id) <= 60),
  full_name      text check (char_length(full_name) <= 120),
  email          text check (char_length(email) <= 254),
  phone          text check (char_length(phone) <= 30),
  city           text check (char_length(city) <= 80),
  message        text check (char_length(message) <= 2000),
  -- Consenso privacy dato con l'invio.
  consent_at     timestamptz not null,
  created_at     timestamptz not null default now(),
  handled_at     timestamptz,
  handled_by     uuid references public.profiles (id) on delete set null,
  check (email is not null or phone is not null)
);

comment on table public.landing_requests is 'Richieste inviate dai moduli di contatto delle landing.';

create index landing_requests_data_idx on public.landing_requests (created_at desc);
create index landing_requests_email_idx on public.landing_requests (email, created_at);
create index landing_requests_telefono_idx on public.landing_requests (phone, created_at);

alter table public.landing_requests enable row level security;
revoke all on public.landing_requests from anon, authenticated;
grant select, update, delete on public.landing_requests to authenticated;

create policy "Richieste delle landing: lettura admin"
  on public.landing_requests for select to authenticated
  using ((select public.is_admin()));

create policy "Richieste delle landing: modifica admin"
  on public.landing_requests for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Richieste delle landing: eliminazione admin"
  on public.landing_requests for delete to authenticated
  using ((select public.is_admin()));

-- -------------------------------------------------------------
-- 3. Statistiche: evento "contatto" (modulo inviato).
-- -------------------------------------------------------------
alter type public.tipo_evento_landing add value if not exists 'contatto';

drop function public.statistiche_landing(integer);

create function public.statistiche_landing(giorni integer default 30)
returns table (landing_id uuid, visite bigint, checkout bigint, acquisti bigint, richieste bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Operazione riservata agli amministratori';
  end if;

  return query
    select e.landing_id,
           count(*) filter (where e.type = 'visita'),
           count(*) filter (where e.type = 'checkout'),
           count(*) filter (where e.type = 'acquisto'),
           count(*) filter (where e.type::text = 'contatto')
      from public.landing_events e
     where e.created_at >= now() - make_interval(days => greatest(giorni, 1))
     group by e.landing_id;
end;
$$;

revoke execute on function public.statistiche_landing(integer) from public, anon;
grant execute on function public.statistiche_landing(integer) to authenticated;

-- -------------------------------------------------------------
-- 4. Bucket delle landing: anche video brevi (max 10 MB).
-- -------------------------------------------------------------
update storage.buckets
   set allowed_mime_types = array[
         'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
         'video/mp4', 'video/webm'
       ]
 where id = 'landing';

-- -------------------------------------------------------------
-- 5. Notifiche: i destinatari esistenti ricevono anche le richieste delle landing.
-- -------------------------------------------------------------
update public.admin_notification_recipients
   set events = array_append(events, 'richiesta_landing')
 where not ('richiesta_landing' = any (events));
