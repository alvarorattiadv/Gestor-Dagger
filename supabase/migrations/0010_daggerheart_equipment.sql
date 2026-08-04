-- ============================================================================
-- Armas (primárias/secundárias) e armaduras — mesmo padrão do resto das
-- regras: schema aqui, dado vem de seed local não commitado.
-- ============================================================================

create table public.weapons (
  id text primary key,
  table_type text not null check (table_type in ('primary', 'secondary')),
  tier int not null check (tier between 1 and 4),
  category text check (category in ('Physical', 'Magic')),
  name text not null,
  trait text not null,
  range text not null,
  damage text not null,
  burden text not null,
  feature text not null default ''
);

create table public.armors (
  id text primary key,
  tier int not null check (tier between 1 and 4),
  name text not null,
  major_threshold int not null,
  severe_threshold int not null,
  base_score int not null,
  feature text not null default ''
);

alter table public.party_characters add column if not exists primary_weapon_id text references public.weapons(id);
alter table public.party_characters add column if not exists secondary_weapon_id text references public.weapons(id);
alter table public.party_characters add column if not exists armor_id text references public.armors(id);

do $$
declare
  t text;
begin
  foreach t in array array['weapons', 'armors']
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
