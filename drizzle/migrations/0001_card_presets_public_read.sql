-- Signed-out visitors open a public pack at /studio?pack=<id> as the anon role.
-- The select policy already allows is_public rows; this grant lets that policy run.
grant select on table public.card_presets to anon;
