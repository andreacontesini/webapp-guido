-- =============================================================
-- Fase 2 — Schema base: profili utente e impostazioni della guida
-- Da eseguire nell'SQL Editor di Supabase (o con `supabase db push`).
-- =============================================================

-- Ruoli applicativi
create type public.ruolo_utente as enum ('cliente', 'admin');

-- -------------------------------------------------------------
-- profiles: un profilo per ogni utente di auth.users
-- -------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text not null,
  first_name          text,
  last_name           text,
  phone               text,
  role                public.ruolo_utente not null default 'cliente',
  is_blocked          boolean not null default false,
  -- Beta: la guida è abilitata di default; l'admin può revocarla.
  guide_access        boolean not null default true,
  privacy_accepted_at timestamptz,
  marketing_consent   boolean not null default false,
  -- Valorizzato quando l'utente completa i dati del primo accesso.
  onboarded_at        timestamptz,
  -- Sessione Supabase Auth attualmente valida (blocco accessi simultanei).
  current_session_id  uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.profiles is 'Dati anagrafici e permessi degli utenti dell''app.';
comment on column public.profiles.current_session_id is 'ID della sessione auth valida: le altre sessioni vengono chiuse.';

-- -------------------------------------------------------------
-- guide_settings: riga unica con i dettagli della guida PDF
-- -------------------------------------------------------------
create table public.guide_settings (
  id           smallint primary key default 1 check (id = 1),
  title        text not null default 'Vendere casa da privato',
  description  text,
  -- Percorso del file nel bucket Storage (caricato in Fase 4).
  file_path    text,
  version      text,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references public.profiles (id) on delete set null
);

comment on table public.guide_settings is 'Impostazioni della guida PDF (una sola riga, id = 1).';

insert into public.guide_settings (id) values (1);

-- -------------------------------------------------------------
-- updated_at automatico
-- -------------------------------------------------------------
create function public.imposta_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.imposta_updated_at();

create trigger guide_settings_updated_at
  before update on public.guide_settings
  for each row execute function public.imposta_updated_at();

-- -------------------------------------------------------------
-- Creazione automatica del profilo alla registrazione
-- -------------------------------------------------------------
create function public.crea_profilo_nuovo_utente()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger alla_registrazione_crea_profilo
  after insert on auth.users
  for each row execute function public.crea_profilo_nuovo_utente();

-- Tiene allineata l'email se l'utente la cambia in Supabase Auth.
create function public.allinea_email_profilo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger al_cambio_email_allinea_profilo
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.allinea_email_profilo();
