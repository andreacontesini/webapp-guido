-- =============================================================
-- Fase 8 — Profilo del cliente
-- Nuovi dati personali su profiles e scheda dell'immobile da vendere
-- (una riga per cliente). Tutto facoltativo. Il cliente legge e
-- modifica solo i propri dati, l'admin legge tutto.
-- =============================================================

alter table public.profiles
  add column residence_city     text check (char_length(residence_city) <= 80),
  add column residence_province text check (char_length(residence_province) <= 40),
  add column contact_preference text check (contact_preference in ('telefono', 'whatsapp', 'email')),
  add column contact_time       text check (contact_time in ('mattina', 'pomeriggio', 'sera', 'indifferente'));

-- Il cliente può modificare anche i nuovi campi (grant per colonna, come gli altri).
grant update (residence_city, residence_province, contact_preference, contact_time)
  on public.profiles to authenticated;

-- Documenti dell'immobile: solo chiavi note e risposte si/no/non_so.
-- (I check non ammettono sottoquery: il controllo sta in una funzione.)
create function public.documenti_validi(documenti jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(documenti) = 'object'
    and documenti - array['atto_provenienza', 'planimetria', 'visura', 'ape', 'agibilita', 'spese_condominiali'] = '{}'::jsonb
    and not exists (
      select 1 from jsonb_each_text(documenti) d where d.value not in ('si', 'no', 'non_so')
    );
$$;

create table public.properties (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references public.profiles (id) on delete cascade,
  -- La casa
  street               text check (char_length(street) <= 120),
  city                 text check (char_length(city) <= 80),
  province             text check (char_length(province) <= 40),
  area                 text check (char_length(area) <= 80),
  property_type        text check (property_type in ('appartamento', 'villa', 'casa_indipendente', 'rustico', 'attico', 'altro')),
  usage                text check (usage in ('abitazione_principale', 'seconda_casa', 'investimento', 'altro')),
  surface_sqm          integer check (surface_sqm between 10 and 2000),
  rooms                integer check (rooms between 1 and 30),
  bedrooms             integer check (bedrooms between 0 and 20),
  bathrooms            integer check (bathrooms between 0 and 10),
  floor                integer check (floor between -2 and 60),
  has_elevator         boolean,
  year_built           integer check (year_built between 1500 and 2100),
  condition            text check (condition in ('da_ristrutturare', 'buono', 'ristrutturato', 'nuovo')),
  energy_class         text check (energy_class in ('A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G', 'non_so')),
  has_garage           boolean,
  has_cellar           boolean,
  has_garden           boolean,
  has_terrace          boolean,
  heating              text check (heating in ('autonomo', 'centralizzato', 'assente', 'non_so')),
  condo_fees_monthly   integer check (condo_fees_monthly between 0 and 5000),
  -- Situazione
  ownership            text check (ownership in ('unico', 'cointestato')),
  owners_count         integer check (owners_count between 2 and 20),
  owners_agree         text check (owners_agree in ('si', 'no', 'non_so')),
  inherited            boolean,
  succession_done      text check (succession_done in ('si', 'no', 'in_corso', 'non_so')),
  mortgage             text check (mortgage in ('nessuno', 'mutuo_residuo', 'ipoteca', 'non_so')),
  occupancy            text check (occupancy in ('libero', 'abitato_proprietario', 'affittato')),
  lease_end            date,
  compliance_doubts    text check (compliance_doubts in ('no', 'si', 'non_so')),
  compliance_notes     text check (char_length(compliance_notes) <= 1000),
  building_bonus_works boolean,
  documents            jsonb not null default '{}'::jsonb check (public.documenti_validi(documents)),
  -- Obiettivi
  sale_timeline        text check (sale_timeline in ('entro_3_mesi', 'entro_6_mesi', 'entro_12_mesi', 'nessuna_fretta')),
  sale_reason          text check (sale_reason in ('acquisto_altra_casa', 'trasferimento', 'eredita', 'liquidita', 'separazione', 'altro')),
  linked_purchase      text check (linked_purchase in ('si', 'no', 'non_so')),
  expected_price       integer check (expected_price between 1000 and 20000000),
  valuation_done       boolean,
  valuation_by         text check (char_length(valuation_by) <= 120),
  listed_before        text check (listed_before in ('no', 'portali_privato', 'agenzia_conclusa', 'agenzia_in_corso')),
  -- Note
  notes                text check (char_length(notes) <= 2000),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.properties is 'Immobile da vendere del cliente (uno per cliente), compilato dal profilo.';
comment on column public.properties.street is 'Facoltativa: visibile solo al cliente e agli admin.';

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.imposta_updated_at();

alter table public.properties enable row level security;

revoke all on public.properties from anon, authenticated;
grant select, insert, update on public.properties to authenticated;

create policy "Lettura del proprio immobile o admin"
  on public.properties for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Inserimento del proprio immobile"
  on public.properties for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Modifica del proprio immobile"
  on public.properties for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
-- Nessuna policy di delete: l'eliminazione arriverà con la parte GDPR (cascade dal profilo).
