-- ============================================================================
-- Distingue NPCs de cidade (aba da cidade) de NPCs globais (aba NPCs & Facções).
-- As duas coisas usam a mesma tabela `npcs`; um NPC global pode opcionalmente
-- referenciar uma cidade (só como marcação, não como "pertence a essa cidade").
-- Sem essa coluna não dá pra saber, só pelo city_id, qual é qual.
-- ============================================================================

alter table public.npcs add column if not exists is_global boolean not null default false;

-- Dado existente: todo NPC sem cidade já era, de fato, um NPC global.
update public.npcs set is_global = true where city_id is null;
