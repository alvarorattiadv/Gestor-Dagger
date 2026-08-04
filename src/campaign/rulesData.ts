import { supabase } from './supabaseClient';
import type {
  Ancestry,
  Armor,
  Community,
  DaggerClass,
  DaggerheartRules,
  Domain,
  DomainCard,
  Subclass,
  Weapon,
} from './rulesTypes';

function domainFromRow(row: any): Domain {
  return { id: row.id, name: row.name, description: row.description };
}

function classFromRow(row: any): DaggerClass {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    domain1: row.domain_1,
    domain2: row.domain_2,
    startingEvasion: row.starting_evasion,
    startingHitPoints: row.starting_hit_points,
    classItems: row.class_items,
    hopeFeature: row.hope_feature,
    classFeatures: row.class_features,
    backgroundQuestions: row.background_questions,
    connections: row.connections,
  };
}

function subclassFromRow(row: any): Subclass {
  return {
    id: row.id,
    classId: row.class_id,
    name: row.name,
    blurb: row.blurb,
    spellcastTrait: row.spellcast_trait,
    foundation: row.foundation,
    specialization: row.specialization,
    mastery: row.mastery,
  };
}

function domainCardFromRow(row: any): DomainCard {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    level: row.level,
    type: row.type,
    recallCost: row.recall_cost,
    description: row.description,
  };
}

function ancestryFromRow(row: any): Ancestry {
  return { id: row.id, name: row.name, description: row.description, features: row.features };
}

function communityFromRow(row: any): Community {
  return { id: row.id, name: row.name, description: row.description, adjectives: row.adjectives, feature: row.feature };
}

function weaponFromRow(row: any): Weapon {
  return {
    id: row.id,
    tableType: row.table_type,
    tier: row.tier,
    category: row.category,
    name: row.name,
    trait: row.trait,
    range: row.range,
    damage: row.damage,
    burden: row.burden,
    feature: row.feature,
  };
}

function armorFromRow(row: any): Armor {
  return {
    id: row.id,
    tier: row.tier,
    name: row.name,
    majorThreshold: row.major_threshold,
    severeThreshold: row.severe_threshold,
    baseScore: row.base_score,
    feature: row.feature,
  };
}

export async function fetchDaggerheartRules(): Promise<DaggerheartRules> {
  const [domainsRes, classesRes, subclassesRes, cardsRes, ancestriesRes, communitiesRes, weaponsRes, armorsRes] = await Promise.all([
    supabase.from('domains').select('*'),
    supabase.from('classes').select('*'),
    supabase.from('subclasses').select('*'),
    supabase.from('domain_cards').select('*'),
    supabase.from('ancestries').select('*'),
    supabase.from('communities').select('*'),
    supabase.from('weapons').select('*'),
    supabase.from('armors').select('*'),
  ]);

  for (const res of [domainsRes, classesRes, subclassesRes, cardsRes, ancestriesRes, communitiesRes, weaponsRes, armorsRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  return {
    domains: (domainsRes.data ?? []).map(domainFromRow),
    classes: (classesRes.data ?? []).map(classFromRow),
    subclasses: (subclassesRes.data ?? []).map(subclassFromRow),
    domainCards: (cardsRes.data ?? []).map(domainCardFromRow),
    ancestries: (ancestriesRes.data ?? []).map(ancestryFromRow),
    communities: (communitiesRes.data ?? []).map(communityFromRow),
    weapons: (weaponsRes.data ?? []).map(weaponFromRow),
    armors: (armorsRes.data ?? []).map(armorFromRow),
  };
}

export interface ClaimResult {
  ok: boolean;
  error: string | null;
}

export interface ClaimedCardInfo {
  characterId: string;
  inLoadout: boolean;
}

/** Every claimed domain card in the campaign, mapped to which character holds it and whether it's active (loadout) or vaulted. */
export async function fetchClaimedDomainCards(): Promise<Record<string, ClaimedCardInfo>> {
  const { data, error } = await supabase.from('character_domain_cards').select('domain_card_id, character_id, in_loadout');
  if (error) throw new Error(error.message);
  const map: Record<string, ClaimedCardInfo> = {};
  for (const row of data ?? []) map[row.domain_card_id] = { characterId: row.character_id, inLoadout: row.in_loadout };
  return map;
}

export async function claimDomainCard(characterId: string, domainCardId: string, inLoadout: boolean): Promise<ClaimResult> {
  const { error } = await supabase.from('character_domain_cards').insert({ character_id: characterId, domain_card_id: domainCardId, in_loadout: inLoadout });
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Essa carta já foi escolhida por outro personagem.' };
    return { ok: false, error: error.message };
  }
  return { ok: true, error: null };
}

export async function releaseDomainCard(characterId: string, domainCardId: string): Promise<void> {
  await supabase.from('character_domain_cards').delete().eq('character_id', characterId).eq('domain_card_id', domainCardId);
}

export async function setDomainCardLoadout(characterId: string, domainCardId: string, inLoadout: boolean): Promise<void> {
  await supabase.from('character_domain_cards').update({ in_loadout: inLoadout }).eq('character_id', characterId).eq('domain_card_id', domainCardId);
}
