-- ============================================================================
-- Fase 5b: avanços de nível por personagem.
--
-- min_tier registra a partir de qual tier cada opção de avanço libera (os
-- ids abaixo já existiam desde 0013 — isso é só marcação de tier, não texto
-- do livro, então pode ficar commitado normalmente).
-- ============================================================================

alter table public.advancement_options add column if not exists min_tier int not null default 2;

update public.advancement_options set min_tier = 3 where id in ('upgraded-subclass-card', 'raise-proficiency', 'multiclass');

-- Registro de cada avanço que um personagem realmente pegou ao subir de
-- nível. "detail" é texto livre (ex: "Agilidade e Instinto", "Domínio Sage,
-- carta X") pra não precisar modelar cada opção em detalhe — mestre/jogador
-- descrevem a escolha, igual fariam na ficha de papel.
create table public.character_advancements (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.party_characters(id) on delete cascade,
  level int not null check (level between 2 and 10),
  option_id text not null references public.advancement_options(id),
  detail text not null default '',
  created_at timestamptz not null default now()
);

alter table public.character_advancements enable row level security;
create policy "character_advancements_select" on public.character_advancements for select using (public.is_approved());
create policy "character_advancements_insert" on public.character_advancements for insert with check (public.is_approved());
create policy "character_advancements_update" on public.character_advancements for update using (public.is_approved());
create policy "character_advancements_delete" on public.character_advancements for delete using (public.is_approved());
grant select, insert, update, delete on public.character_advancements to authenticated;
