-- =============================================================
-- Fase 4 — Accesso alla guida solo per chi ne ha diritto
-- Chi si registra liberamente non vede la guida: il permesso lo
-- assegna l'admin (in beta) e, dalla Fase 9, lo sblocca il pagamento.
-- Gli utenti già registrati mantengono il permesso che hanno.
-- =============================================================

alter table public.profiles
  alter column guide_access set default false;

comment on column public.profiles.guide_access is
  'Accesso alla guida PDF: assegnato dall''admin o sbloccato dal pagamento (mai lato client).';
