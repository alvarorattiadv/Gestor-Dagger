-- ============================================================================
-- Ancestralidade e Comunidade — mesmo padrão do 0004/0006: schema aqui,
-- dado vem de seed local não commitado.
-- ============================================================================

create table public.ancestries (
  id text primary key,
  name text not null,
  description text not null,
  features jsonb not null
);

create table public.communities (
  id text primary key,
  name text not null,
  description text not null,
  adjectives jsonb not null,
  feature jsonb not null
);

alter table public.party_characters add column if not exists ancestry_id text references public.ancestries(id);
alter table public.party_characters add column if not exists community_id text references public.communities(id);

do $$
declare
  t text;
begin
  foreach t in array array['ancestries', 'communities']
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
