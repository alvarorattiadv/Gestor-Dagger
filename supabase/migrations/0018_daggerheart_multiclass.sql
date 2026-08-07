-- ============================================================================
-- Multiclasse: classe adicional, o único domínio escolhido dela, e a
-- subclasse (pra pegar a fundação). A regra explicitamente NÃO dá a
-- habilidade de Esperança da classe multiclassada — isso é tratado só na
-- tela (não mostramos essa feature pra classe secundária).
-- ============================================================================

alter table public.party_characters add column if not exists multiclass_class_id text references public.classes(id);
alter table public.party_characters add column if not exists multiclass_subclass_id text references public.subclasses(id);
alter table public.party_characters add column if not exists multiclass_domain_id text references public.domains(id);
