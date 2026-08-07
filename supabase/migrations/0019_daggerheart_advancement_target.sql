-- ============================================================================
-- Quando o avanço escolhido é "carta de subclasse melhorada", precisamos
-- saber se foi aplicado na subclasse ORIGINAL ou na de MULTICLASSE — cada
-- uma progride separado, e a de multiclasse só chega até especialização
-- (nunca maestria). Nulo = original (mantém compatível com o que já foi
-- registrado antes desta coluna existir).
-- ============================================================================

alter table public.character_advancements add column if not exists applies_to text check (applies_to in ('primary', 'multiclass'));
