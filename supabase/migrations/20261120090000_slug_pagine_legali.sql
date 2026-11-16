-- =============================================================
-- Percorsi riservati delle landing: aggiunge le pagine legali
-- (condizioni-di-vendita, privacy, cookie) e "acquisto", già
-- usato dalle pagine di ritorno da Stripe. Allineato con
-- `PERCORSI_RISERVATI` in src/lib/landing/slug.ts.
-- =============================================================

alter table public.landing_pages drop constraint landing_pages_slug_check;
alter table public.landing_pages add constraint landing_pages_slug_check check (
  slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  and char_length(slug) <= 80
  and slug not in (
    'accesso', 'acquisto', 'admin', 'anteprima', 'api', 'auth', 'benvenuto',
    'condizioni-di-vendita', 'cookie', 'dashboard', 'opengraph-image', 'privacy',
    'robots.txt', 'sitemap.xml', 'twitter-image'
  )
);
