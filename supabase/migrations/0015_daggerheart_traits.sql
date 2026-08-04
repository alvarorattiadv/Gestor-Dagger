-- ============================================================================
-- Traços de personagem (Agilidade, Força, Finesse, Instinto, Presença,
-- Conhecimento) e Proficiência. Faltavam na ficha — sem eles, alguns
-- cálculos (ex: Bare Bones usa Força, Galapa usa Proficiência) ficavam
-- incompletos.
-- ============================================================================

alter table public.party_characters add column if not exists trait_agility int not null default 0;
alter table public.party_characters add column if not exists trait_strength int not null default 0;
alter table public.party_characters add column if not exists trait_finesse int not null default 0;
alter table public.party_characters add column if not exists trait_instinct int not null default 0;
alter table public.party_characters add column if not exists trait_presence int not null default 0;
alter table public.party_characters add column if not exists trait_knowledge int not null default 0;
alter table public.party_characters add column if not exists proficiency int not null default 1;
