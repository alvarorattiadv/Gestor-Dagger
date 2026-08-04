-- ============================================================================
-- Ajustes manuais de Evasão/PV/Stress/Limiares — cobre bônus permanentes que
-- não dá pra deduzir automaticamente das regras (ex: a carta Vitality do
-- domínio Blade deixa escolher 2 de 3 benefícios permanentes na hora que
-- você pega a carta; isso é escolha do jogador, não uma regra fixa pra
-- extrair de texto). O cálculo automático (classe + armadura +
-- ancestralidade) soma com esses valores.
-- ============================================================================

alter table public.party_characters add column if not exists bonus_evasion int not null default 0;
alter table public.party_characters add column if not exists bonus_hit_points int not null default 0;
alter table public.party_characters add column if not exists bonus_stress int not null default 0;
alter table public.party_characters add column if not exists bonus_major_threshold int not null default 0;
alter table public.party_characters add column if not exists bonus_severe_threshold int not null default 0;
