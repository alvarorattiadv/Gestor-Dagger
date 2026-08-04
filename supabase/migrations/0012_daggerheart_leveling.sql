-- ============================================================================
-- Regras de subir de nível — mesmo padrão do resto: schema aqui, dado vem
-- de seed local não commitado.
--
-- Nota: isso guarda a REGRA (texto de referência), não o controle de "quantas
-- vezes cada jogador já pegou tal avanço" — esse acompanhamento por
-- personagem é trabalho da fase 5 (tela de personagem/subir de nível).
-- ============================================================================

create table public.leveling_tiers (
  tier int primary key,
  level_range text not null,
  notes text not null
);

create table public.level_achievements (
  level int primary key,
  description text not null
);

create table public.advancement_options (
  id text primary key,
  name text not null,
  slot_cost int not null default 1,
  description text not null
);

create table public.leveling_steps (
  step_order int primary key,
  title text not null,
  description text not null
);

do $$
declare
  t text;
begin
  foreach t in array array['leveling_tiers', 'level_achievements', 'advancement_options', 'leveling_steps']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s_select" on public.%1$I for select using (public.is_approved())', t);
    execute format('create policy "%1$s_write" on public.%1$I for insert with check (public.is_gm())', t);
    execute format('create policy "%1$s_update" on public.%1$I for update using (public.is_gm())', t);
    execute format('create policy "%1$s_delete" on public.%1$I for delete using (public.is_gm())', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;
