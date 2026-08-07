-- ============================================================================
-- Companheiro do Ranger (subclasse Beastbound). Evasão do companheiro e
-- espaços de Stress são calculados na tela (base + bônus de "Aware"/
-- "Resilient" já registrados em companion_advancements) — aqui só guardamos
-- a base editável e o que foi registrado.
-- ============================================================================

alter table public.party_characters add column if not exists companion_name text not null default '';
alter table public.party_characters add column if not exists companion_evasion_base int not null default 10;
alter table public.party_characters add column if not exists companion_stress_base int not null default 3;
alter table public.party_characters add column if not exists companion_marked_stress int not null default 0;
alter table public.party_characters add column if not exists companion_attack text not null default '';
alter table public.party_characters add column if not exists companion_damage_die text not null default 'd6';
alter table public.party_characters add column if not exists companion_range text not null default 'Melee';
alter table public.party_characters add column if not exists companion_experiences jsonb not null default '[]'::jsonb;
alter table public.party_characters add column if not exists companion_advancements jsonb not null default '[]'::jsonb;
