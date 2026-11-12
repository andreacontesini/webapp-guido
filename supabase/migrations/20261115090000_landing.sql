-- =============================================================
-- Fase 8 — Landing di vendita (landing_pages)
-- Pagine pubbliche composte da blocchi predefiniti (JSON in `blocks`,
-- formato descritto in `src/lib/landing/blocchi.ts`).
-- Chiunque, anche senza account, legge le landing pubblicate; solo
-- l'admin legge le bozze e crea, modifica o elimina le landing.
-- =============================================================

create type public.stato_landing as enum (
  'bozza',      -- visibile solo in admin
  'pubblicata'  -- online all'indirizzo /<slug>
);

create table public.landing_pages (
  id              uuid primary key default gen_random_uuid(),
  -- Indirizzo della pagina (/<slug>): minuscole, numeri e trattini.
  slug            text not null unique
                  check (
                    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
                    and char_length(slug) <= 80
                    -- Percorsi già usati dall'app (vedi `PERCORSI_RISERVATI`).
                    and slug not in (
                      'accesso', 'admin', 'api', 'auth', 'benvenuto', 'dashboard',
                      'opengraph-image', 'robots.txt', 'sitemap.xml', 'twitter-image'
                    )
                  ),
  -- Nome interno, mostrato in admin.
  title           text not null check (char_length(title) between 2 and 120),
  -- Titolo e descrizione per motori di ricerca e condivisione.
  seo_title       text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 300),
  -- Immagine di anteprima (1200×630); se manca si usa quella generata dall'app.
  og_image_url    text,
  blocks          jsonb not null default '[]'::jsonb
                  check (jsonb_typeof(blocks) = 'array'),
  status          public.stato_landing not null default 'bozza',
  -- Landing mostrata come pagina iniziale ("/"): al massimo una, e pubblicata.
  is_home         boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      uuid references public.profiles (id) on delete set null,
  constraint landing_home_pubblicata check (not is_home or status = 'pubblicata')
);

comment on table public.landing_pages is 'Landing di vendita pubbliche, composte da blocchi predefiniti.';
comment on column public.landing_pages.blocks is 'Array di blocchi: formato in src/lib/landing/blocchi.ts.';
comment on column public.landing_pages.is_home is 'True per la landing mostrata come pagina iniziale (al massimo una).';

create unique index landing_pages_una_sola_home
  on public.landing_pages (is_home)
  where is_home;

create trigger landing_pages_updated_at
  before update on public.landing_pages
  for each row execute function public.imposta_updated_at();

-- -------------------------------------------------------------
-- RLS: lettura pubblica delle landing pubblicate, tutto il resto
-- solo admin.
-- -------------------------------------------------------------
alter table public.landing_pages enable row level security;

revoke all on public.landing_pages from anon, authenticated;
grant select on public.landing_pages to anon, authenticated;
grant insert, update, delete on public.landing_pages to authenticated;

create policy "Lettura delle landing pubblicate"
  on public.landing_pages for select
  to anon, authenticated
  using (status = 'pubblicata');

create policy "Lettura di tutte le landing per admin"
  on public.landing_pages for select
  to authenticated
  using ((select public.is_admin()));

create policy "Creazione landing solo admin"
  on public.landing_pages for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Modifica landing solo admin"
  on public.landing_pages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Eliminazione landing solo admin"
  on public.landing_pages for delete
  to authenticated
  using ((select public.is_admin()));

-- -------------------------------------------------------------
-- Imposta (o toglie) la landing della pagina iniziale in un'unica
-- transazione, così l'indice "una sola home" non scatta a metà.
-- -------------------------------------------------------------
create function public.imposta_landing_iniziale(landing_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Operazione riservata agli amministratori';
  end if;

  update public.landing_pages set is_home = false where is_home;

  if landing_id is not null then
    update public.landing_pages
       set is_home = true
     where id = landing_id and status = 'pubblicata';
    if not found then
      raise exception 'La landing deve esistere ed essere pubblicata';
    end if;
  end if;
end;
$$;

revoke execute on function public.imposta_landing_iniziale(uuid) from public, anon;
grant execute on function public.imposta_landing_iniziale(uuid) to authenticated;
