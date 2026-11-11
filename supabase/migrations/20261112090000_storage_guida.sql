-- =============================================================
-- Fase 3 — Bucket privato per la guida PDF
-- Nessuna policy su storage.objects: gli utenti non possono leggere
-- né elencare i file direttamente. Il PDF viene consegnato solo dalla
-- route dell'app (/dashboard/guida/file), che controlla sessione e
-- permesso `guide_access` e legge il file con la service role.
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guida', 'guida', false, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
