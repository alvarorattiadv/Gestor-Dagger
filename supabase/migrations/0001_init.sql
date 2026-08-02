-- ============================================================================
-- Gestor Dagger — schema inicial (versão simples)
-- ============================================================================
-- Rode este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor > New query).
--
-- Regra de segurança aqui é simples e direta, pensada pra um grupo de amigos:
--   - Só quem tem conta aprovada (mestre ou jogador) lê e escreve qualquer coisa.
--   - Só o mestre pode excluir.
--   - Quem edita o quê (campo geral só mestre, anotação só jogador, segredo só
--     mestre vê) continua sendo resolvido na tela, igual já funciona hoje.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- PERFIS (uma linha por usuário autenticado — mestre ou jogador)
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('gm', 'player')) default 'player',
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  display_name text not null default '',
  linked_character_id uuid,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

grant select on public.profiles to authenticated;

-- Cria automaticamente um perfil "jogador pendente" sempre que alguém cria conta.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- FUNÇÕES DE APOIO
-- ============================================================================

create function public.is_gm() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'gm' and status = 'approved'
  );
$$;

create function public.is_approved() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

grant execute on function public.is_gm() to authenticated;
grant execute on function public.is_approved() to authenticated;

-- ============================================================================
-- Tabela padrão pra tudo que é "conteúdo de campanha": qualquer aprovado lê,
-- cria e edita; só o mestre exclui. Repetido pra cada entidade abaixo.
-- ============================================================================

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Nova Cidade',
  summary text not null default '',
  gm_secret text not null default '',
  player_notes text not null default '',
  map jsonb not null default '{"background":"parchment","markers":[]}'::jsonb,
  morale jsonb not null default '{"score":50,"notes":"","log":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.npcs (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete cascade,
  name text not null default 'Novo NPC',
  role text not null default '',
  description text not null default '',
  secret text not null default '',
  player_notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.rumors (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  text text not null default '',
  status text not null check (status in ('nao-verificado', 'confirmado', 'desmentido')) default 'nao-verificado',
  source text not null default '',
  notes text not null default '',
  player_notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.factions (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null default 'Nova facção',
  leader text not null default '',
  description text not null default '',
  notes text not null default '',
  player_notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.templar_members (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null default 'Novo Templário',
  status text not null check (status in ('grao-mestre', 'secreto', 'discreto', 'suspeito', 'outro')) default 'suspeito',
  description text not null default '',
  gm_secret text not null default '',
  player_notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.templar_order (
  id boolean primary key default true check (id),
  notes text not null default '',
  player_notes text not null default ''
);
insert into public.templar_order (id) values (true);

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Novo artefato',
  description text not null default '',
  status text not null check (status in ('confirmado', 'mito', 'destruido')) default 'mito',
  possible_location text not null default '',
  possible_owner text not null default '',
  gm_secret text not null default '',
  player_notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.party_characters (
  id uuid primary key default gen_random_uuid(),
  linked_user_id uuid references auth.users(id) on delete set null,
  player_name text not null default '',
  char_name text not null default 'Novo Personagem',
  ancestry_class text not null default '',
  notes text not null default '',
  gm_secret text not null default '',
  player_notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  title text not null default '',
  summary text not null default '',
  hooks text not null default '',
  loot_xp text not null default '',
  created_at timestamptz not null default now()
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  title text not null default 'Novo fio narrativo',
  status text not null check (status in ('ativo', 'concluido', 'esquecido')) default 'ativo',
  description text not null default '',
  updated_at timestamptz not null default now()
);

create table public.world_map (
  id boolean primary key default true check (id),
  background text not null default 'parchment',
  markers jsonb not null default '[]'::jsonb,
  custom_image text,
  custom_image_aspect_ratio text
);
insert into public.world_map (id) values (true);

create table public.party_resources (
  id boolean primary key default true check (id),
  hope int not null default 2,
  fear int not null default 0
);
insert into public.party_resources (id) values (true);

create table public.campaign_meta (
  id boolean primary key default true check (id),
  name text not null default 'Minha Campanha de Daggerheart'
);
insert into public.campaign_meta (id) values (true);

-- ============================================================================
-- Segurança: mesma regra simples pra todas as tabelas de conteúdo acima.
--   ler/criar/editar: qualquer aprovado (mestre ou jogador)
--   excluir: só mestre
--   nas 3 tabelas "singleton" (mapa mundi, esperança/medo, nome) não tem exclusão.
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'cities', 'npcs', 'rumors', 'factions', 'templar_members', 'templar_order',
    'artifacts', 'party_characters', 'sessions', 'threads',
    'world_map', 'party_resources', 'campaign_meta'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s_select" on public.%1$I for select using (public.is_approved())', t);
    execute format('create policy "%1$s_insert" on public.%1$I for insert with check (public.is_approved())', t);
    execute format('create policy "%1$s_update" on public.%1$I for update using (public.is_approved())', t);
    execute format('create policy "%1$s_delete" on public.%1$I for delete using (public.is_gm())', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;

-- ============================================================================
-- APROVAÇÃO DE JOGADORES E VÍNCULO COM PERSONAGEM
-- ============================================================================

create function public.approve_player(p_user_id uuid, p_character_id uuid default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_gm() then raise exception 'not authorized'; end if;
  update public.profiles set status = 'approved', linked_character_id = p_character_id where id = p_user_id;
  if p_character_id is not null then
    update public.party_characters set linked_user_id = p_user_id where id = p_character_id;
  end if;
end;
$$;

create function public.reject_player(p_user_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_gm() then raise exception 'not authorized'; end if;
  update public.profiles set status = 'rejected' where id = p_user_id;
end;
$$;

grant execute on function public.approve_player(uuid, uuid) to authenticated;
grant execute on function public.reject_player(uuid) to authenticated;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
-- Depois de rodar isso, faça o PRIMEIRO cadastro pelo próprio app (você, o mestre).
-- Copie o UUID desse usuário em Authentication > Users, e rode (só uma vez):
--
--   update public.profiles set role = 'gm', status = 'approved' where id = 'COLE-O-UUID-AQUI';
--
