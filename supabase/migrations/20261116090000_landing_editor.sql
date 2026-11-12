-- =============================================================
-- Fase 9 — Editor delle landing
-- 1. Percorso riservato "anteprima" (anteprima delle bozze in admin).
-- 2. Bucket pubblico per le immagini delle landing.
-- 3. Eventi di conversione (visita → checkout → acquisto), anonimi.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Slug: aggiunge "anteprima" ai percorsi riservati
-- -------------------------------------------------------------
alter table public.landing_pages drop constraint landing_pages_slug_check;
alter table public.landing_pages add constraint landing_pages_slug_check check (
  slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  and char_length(slug) <= 80
  -- Percorsi già usati dall'app (vedi `PERCORSI_RISERVATI`).
  and slug not in (
    'accesso', 'admin', 'anteprima', 'api', 'auth', 'benvenuto', 'dashboard',
    'opengraph-image', 'robots.txt', 'sitemap.xml', 'twitter-image'
  )
);

-- -------------------------------------------------------------
-- 2. Immagini delle landing: bucket pubblico in lettura.
-- Nessuna policy di scrittura: si carica solo con un URL firmato
-- creato lato server dopo il controllo del ruolo admin.
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'landing', 'landing', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- -------------------------------------------------------------
-- 3. Eventi di conversione
-- Nessun dato personale, nessun cookie: solo landing, tipo e data.
-- Scritti dal server (service role), letti in forma aggregata
-- dall'admin con `statistiche_landing`.
-- -------------------------------------------------------------
create type public.tipo_evento_landing as enum ('visita', 'checkout', 'acquisto');

create table public.landing_events (
  id          bigint generated always as identity primary key,
  landing_id  uuid not null references public.landing_pages (id) on delete cascade,
  type        public.tipo_evento_landing not null,
  created_at  timestamptz not null default now()
);

comment on table public.landing_events is 'Eventi anonimi di conversione delle landing (visita, checkout, acquisto).';

create index landing_events_landing_data_idx on public.landing_events (landing_id, created_at);

alter table public.landing_events enable row level security;
revoke all on public.landing_events from anon, authenticated;
-- Nessuna policy: lettura e scrittura solo con la service role.

-- Totali per landing negli ultimi `giorni` giorni (solo admin).
create function public.statistiche_landing(giorni integer default 30)
returns table (landing_id uuid, visite bigint, checkout bigint, acquisti bigint)
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
           count(*) filter (where e.type = 'acquisto')
      from public.landing_events e
     where e.created_at >= now() - make_interval(days => greatest(giorni, 1))
     group by e.landing_id;
end;
$$;

revoke execute on function public.statistiche_landing(integer) from public, anon;
grant execute on function public.statistiche_landing(integer) to authenticated;
