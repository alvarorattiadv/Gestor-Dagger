-- ============================================================================
-- Evita que o bônus automático de nível (Proficiência + Experiência nos
-- níveis 2/5/8) seja aplicado mais de uma vez por nível ao clicar em
-- "Aplicar" repetidamente na ficha.
-- ============================================================================

alter table public.party_characters add column if not exists applied_achievement_levels jsonb not null default '[]'::jsonb;
