-- ============================================================================
-- Ancestralidade mista: personagem descende de duas ancestralidades, pega a
-- PRIMEIRA feature de uma e a SEGUNDA feature da outra (regra do livro,
-- página 71 — "Mixed Ancestry"). Quando ativa, substitui a ancestry_id
-- única (que fica sem uso nesse modo).
-- ============================================================================

alter table public.party_characters add column if not exists is_mixed_ancestry boolean not null default false;
alter table public.party_characters add column if not exists mixed_ancestry_first_id text references public.ancestries(id);
alter table public.party_characters add column if not exists mixed_ancestry_second_id text references public.ancestries(id);
alter table public.party_characters add column if not exists heritage_name text not null default '';
