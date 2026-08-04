-- ============================================================================
-- Rastreio de mesa: PV/Stress/Espaços de Armadura marcados, Esperança do
-- personagem (a Esperança já existia como recurso do GRUPO em
-- party_resources — isso aqui é a Esperança individual do personagem, como
-- a regra realmente funciona), e Experiências (lista livre de nome + bônus).
-- ============================================================================

alter table public.party_characters add column if not exists marked_hit_points int not null default 0;
alter table public.party_characters add column if not exists marked_stress int not null default 0;
alter table public.party_characters add column if not exists marked_armor_slots int not null default 0;
alter table public.party_characters add column if not exists hope int not null default 2;
alter table public.party_characters add column if not exists hope_max int not null default 6;
alter table public.party_characters add column if not exists experiences jsonb not null default '[]'::jsonb;
