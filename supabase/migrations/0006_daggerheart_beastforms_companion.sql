-- ============================================================================
-- Extras específicos de classe: Formas de Fera do Druida e opções de
-- evolução do Companheiro do Ranger. Mesma lógica do 0004: schema aqui,
-- dado vem de um seed local não commitado (livro comprado, não SRD livre).
-- ============================================================================

create table public.beastform_options (
  id text primary key,
  tier int not null check (tier between 1 and 4),
  name text not null,
  examples text not null,
  trait_bonus text,
  evasion_bonus int,
  attack text,
  advantages jsonb not null default '[]'::jsonb,
  features jsonb not null
);

create table public.companion_level_options (
  id text primary key,
  name text not null,
  description text not null
);

do $$
declare
  t text;
begin
  foreach t in array array['beastform_options', 'companion_level_options']
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
