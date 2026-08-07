-- ============================================================================
-- Forma de Fera atual do personagem (Druida). Duas formas especiais exigem
-- escolhas extras:
--   - "Legendary Beast" / "Mythic Beast" (Evolved): evolui UMA forma-base
--     de tier menor — guarda qual em beastform_evolved_source_id.
--   - "Legendary Hybrid" / "Mythic Hybrid": combina vantagens/talentos de
--     2 ou 3 formas-base — guarda as fontes escolhidas e quais vantagens/
--     talentos específicos foram selecionados do conjunto combinado.
-- ============================================================================

alter table public.party_characters add column if not exists beastform_id text references public.beastform_options(id);
alter table public.party_characters add column if not exists beastform_evolved_source_id text references public.beastform_options(id);
alter table public.party_characters add column if not exists beastform_hybrid_sources jsonb not null default '[]'::jsonb;
alter table public.party_characters add column if not exists beastform_hybrid_advantages jsonb not null default '[]'::jsonb;
alter table public.party_characters add column if not exists beastform_hybrid_features jsonb not null default '[]'::jsonb;
