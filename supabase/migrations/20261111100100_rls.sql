-- =============================================================
-- Fase 2 — Row Level Security
-- Principio: ogni utente vede e modifica solo il proprio profilo e
-- solo i campi anagrafici. Ruolo, blocco, permessi e sessione si
-- cambiano solo lato server (service role) o da un admin.
-- =============================================================

-- True se l'utente corrente è admin. SECURITY DEFINER evita la
-- ricorsione delle policy su profiles.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and not is_blocked
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- -------------------------------------------------------------
-- profiles
-- -------------------------------------------------------------
alter table public.profiles enable row level security;

-- Nessun accesso anonimo; agli utenti autenticati solo ciò che serve.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
-- Aggiornamento limitato ai soli campi modificabili dall'utente.
grant update (first_name, last_name, phone, privacy_accepted_at, marketing_consent, onboarded_at)
  on public.profiles to authenticated;

create policy "Lettura del proprio profilo o admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Modifica del proprio profilo"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) and not is_blocked)
  with check (id = (select auth.uid()));

-- Insert/delete: nessuna policy → consentiti solo a trigger e service role.

-- -------------------------------------------------------------
-- guide_settings
-- -------------------------------------------------------------
alter table public.guide_settings enable row level security;

revoke all on public.guide_settings from anon, authenticated;
grant select, update on public.guide_settings to authenticated;

create policy "Lettura impostazioni guida per utenti abilitati"
  on public.guide_settings for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and guide_access and not is_blocked
    )
  );

create policy "Modifica impostazioni guida solo admin"
  on public.guide_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- -------------------------------------------------------------
-- Sessione unica: registra come valida la sessione del JWT corrente.
-- Chiamata dall'app subito dopo il login (vince l'ultimo accesso).
-- -------------------------------------------------------------
create function public.registra_sessione_corrente()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  sessione uuid := nullif((select auth.jwt()) ->> 'session_id', '')::uuid;
begin
  if (select auth.uid()) is null or sessione is null then
    raise exception 'Sessione non valida';
  end if;

  update public.profiles
     set current_session_id = sessione
   where id = (select auth.uid());
end;
$$;

revoke execute on function public.registra_sessione_corrente() from public, anon;
grant execute on function public.registra_sessione_corrente() to authenticated;
