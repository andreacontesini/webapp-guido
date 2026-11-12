-- Dominio di pubblicazione di ogni landing.
-- Per ora è attivo solo il dominio dell'app: la scelta del dominio principale
-- è già salvabile nel modello ma verrà abilitata insieme allo smistamento nel proxy.

create type public.dominio_landing as enum ('app', 'principale');

alter table public.landing_pages
  add column domain public.dominio_landing not null default 'app';

comment on column public.landing_pages.domain is
  'Dominio su cui pubblicare la landing: app (app.guidocontesini.it) o principale (guidocontesini.it, non ancora attivo).';
