-- ============================================================================
-- Regras de Daggerheart: domínios, classes, subclasses e cartas de domínio.
-- Isso é conteúdo de REGRA DO JOGO (referência), não conteúdo da campanha —
-- fica em tabelas separadas das de cidades/NPCs/etc.
--
-- O dado em si (nome de carta, texto de habilidade) NÃO vem neste arquivo.
-- Esse arquivo só cria a estrutura; os dados são carregados por um segundo
-- arquivo local que não é commitado no git (ver README do scratchpad),
-- porque vem do livro comprado, não da SRD de uso livre.
-- ============================================================================

create table public.domains (
  id text primary key,
  name text not null,
  description text not null
);

create table public.classes (
  id text primary key,
  name text not null,
  description text not null,
  domain_1 text not null references public.domains(id),
  domain_2 text not null references public.domains(id),
  starting_evasion int not null,
  starting_hit_points int not null,
  class_items text not null,
  hope_feature jsonb not null,
  class_features jsonb not null,
  background_questions jsonb not null,
  connections jsonb not null
);

create table public.subclasses (
  id text primary key,
  class_id text not null references public.classes(id) on delete cascade,
  name text not null,
  blurb text not null,
  spellcast_trait text,
  foundation jsonb not null,
  specialization jsonb not null,
  mastery jsonb not null
);

create table public.domain_cards (
  id text primary key,
  name text not null,
  domain text not null references public.domains(id),
  level int not null check (level between 1 and 10),
  type text not null check (type in ('Ability', 'Spell', 'Grimoire')),
  recall_cost int not null,
  description text not null
);

-- Personagem ganha classe/subclasse/nível (a tabela party_characters já existe
-- desde a migração de vínculo de contas).
alter table public.party_characters add column if not exists class_id text references public.classes(id);
alter table public.party_characters add column if not exists subclass_id text references public.subclasses(id);
alter table public.party_characters add column if not exists level int not null default 1;

-- Cartas de domínio que cada personagem já escolheu. A constraint unique em
-- domain_card_id é a trava de "carta única na campanha inteira": se o
-- personagem do Anderson já pegou uma carta, ninguém mais consegue inserir
-- a mesma domain_card_id — o Postgres rejeita direto, sem precisar de
-- lógica extra no app.
create table public.character_domain_cards (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.party_characters(id) on delete cascade,
  domain_card_id text not null references public.domain_cards(id),
  in_loadout boolean not null default true,
  acquired_at timestamptz not null default now(),
  unique (domain_card_id)
);

-- ============================================================================
-- Segurança: tabelas de referência (domains/classes/subclasses/domain_cards)
-- são só-leitura pra jogadores — só o mestre altera esse conteúdo (é regra
-- do livro, não deveria mudar em jogo). character_domain_cards é diferente:
-- é o jogador escolhendo/trocando carta do próprio personagem, então ali
-- qualquer aprovado pode inserir/remover, não só o mestre.
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array['domains', 'classes', 'subclasses', 'domain_cards']
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

alter table public.character_domain_cards enable row level security;
create policy "character_domain_cards_select" on public.character_domain_cards for select using (public.is_approved());
create policy "character_domain_cards_insert" on public.character_domain_cards for insert with check (public.is_approved());
create policy "character_domain_cards_update" on public.character_domain_cards for update using (public.is_approved());
create policy "character_domain_cards_delete" on public.character_domain_cards for delete using (public.is_approved());
grant select, insert, update, delete on public.character_domain_cards to authenticated;
