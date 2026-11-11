-- =============================================================
-- Keep-alive: funzione chiamata ogni 3 giorni dalla GitHub Action
-- `.github/workflows/supabase-keepalive.yml`, così il progetto sul
-- piano gratuito non viene messo in pausa per inattività.
-- Non legge né espone dati: esegue solo una query sul database.
-- =============================================================

create function public.ping()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select now();
$$;

comment on function public.ping() is 'Keep-alive per il piano gratuito di Supabase (GitHub Action).';

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;
