import { supabase } from './supabaseClient';
import type {
  Artifact,
  Campaign,
  City,
  Faction,
  GlobalNpc,
  MapData,
  Npc,
  Player,
  Rumor,
  Session,
  TemplarMember,
  Thread,
} from './types';
import { emptyCampaign } from './types';

function logSyncError(context: string, error: unknown) {
  console.warn(`[supabase sync] ${context} falhou:`, error);
}

// ---------------------------------------------------------------------------
// Row -> app-shape mappers
// ---------------------------------------------------------------------------

function cityFromRow(row: any): Omit<City, 'npcs' | 'rumors'> {
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    gmSecret: row.gm_secret,
    playerNotes: row.player_notes,
    map: row.map as MapData,
    morale: row.morale,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function cityNpcFromRow(row: any): Npc {
  return { id: row.id, name: row.name, role: row.role, description: row.description, secret: row.secret, playerNotes: row.player_notes };
}

function globalNpcFromRow(row: any): GlobalNpc {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    description: row.description,
    secret: row.secret,
    playerNotes: row.player_notes,
    cityId: row.city_id ?? undefined,
  };
}

function rumorFromRow(row: any): Rumor {
  return { id: row.id, text: row.text, status: row.status, source: row.source, notes: row.notes, playerNotes: row.player_notes };
}

function factionFromRow(row: any): Faction {
  return {
    id: row.id,
    name: row.name,
    leader: row.leader,
    description: row.description,
    notes: row.notes,
    playerNotes: row.player_notes,
    cityId: row.city_id ?? undefined,
  };
}

function templarFromRow(row: any): TemplarMember {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    description: row.description,
    gmSecret: row.gm_secret,
    playerNotes: row.player_notes,
    cityId: row.city_id ?? undefined,
  };
}

function artifactFromRow(row: any): Artifact {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    possibleLocation: row.possible_location,
    possibleOwner: row.possible_owner,
    gmSecret: row.gm_secret,
    playerNotes: row.player_notes,
  };
}

function playerFromRow(row: any): Player {
  return {
    id: row.id,
    playerName: row.player_name,
    charName: row.char_name,
    ancestryClass: row.ancestry_class,
    notes: row.notes,
    gmSecret: row.gm_secret,
    playerNotes: row.player_notes,
    linkedUserId: row.linked_user_id ?? undefined,
    classId: row.class_id ?? undefined,
    subclassId: row.subclass_id ?? undefined,
    level: row.level ?? 1,
    ancestryId: row.ancestry_id ?? undefined,
    communityId: row.community_id ?? undefined,
    primaryWeaponId: row.primary_weapon_id ?? undefined,
    secondaryWeaponId: row.secondary_weapon_id ?? undefined,
    armorId: row.armor_id ?? undefined,
    bonusEvasion: row.bonus_evasion ?? 0,
    bonusHitPoints: row.bonus_hit_points ?? 0,
    bonusStress: row.bonus_stress ?? 0,
    bonusMajorThreshold: row.bonus_major_threshold ?? 0,
    bonusSevereThreshold: row.bonus_severe_threshold ?? 0,
    traitAgility: row.trait_agility ?? 0,
    traitStrength: row.trait_strength ?? 0,
    traitFinesse: row.trait_finesse ?? 0,
    traitInstinct: row.trait_instinct ?? 0,
    traitPresence: row.trait_presence ?? 0,
    traitKnowledge: row.trait_knowledge ?? 0,
    proficiency: row.proficiency ?? 1,
    markedHitPoints: row.marked_hit_points ?? 0,
    markedStress: row.marked_stress ?? 0,
    markedArmorSlots: row.marked_armor_slots ?? 0,
    hope: row.hope ?? 2,
    hopeMax: row.hope_max ?? 6,
    experiences: row.experiences ?? [],
    multiclassClassId: row.multiclass_class_id ?? undefined,
    multiclassSubclassId: row.multiclass_subclass_id ?? undefined,
    multiclassDomainId: row.multiclass_domain_id ?? undefined,
  };
}

function sessionFromRow(row: any): Session {
  return { id: row.id, date: row.date, title: row.title, summary: row.summary, hooks: row.hooks, lootXp: row.loot_xp };
}

function threadFromRow(row: any): Thread {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    description: row.description,
    cityId: row.city_id ?? undefined,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Fetch everything and assemble into the app's Campaign shape
// ---------------------------------------------------------------------------

export async function fetchCampaign(): Promise<Campaign> {
  const [
    citiesRes,
    npcsRes,
    rumorsRes,
    factionsRes,
    templarsRes,
    templarOrderRes,
    artifactsRes,
    playersRes,
    sessionsRes,
    threadsRes,
    worldMapRes,
    partyRes,
    metaRes,
  ] = await Promise.all([
    supabase.from('cities').select('*').order('created_at', { ascending: true }),
    supabase.from('npcs').select('*'),
    supabase.from('rumors').select('*'),
    supabase.from('factions').select('*'),
    supabase.from('templar_members').select('*'),
    supabase.from('templar_order').select('*').eq('id', true).maybeSingle(),
    supabase.from('artifacts').select('*'),
    supabase.from('party_characters').select('*'),
    supabase.from('sessions').select('*').order('date', { ascending: false }),
    supabase.from('threads').select('*'),
    supabase.from('world_map').select('*').eq('id', true).maybeSingle(),
    supabase.from('party_resources').select('*').eq('id', true).maybeSingle(),
    supabase.from('campaign_meta').select('*').eq('id', true).maybeSingle(),
  ]);

  for (const res of [
    citiesRes,
    npcsRes,
    rumorsRes,
    factionsRes,
    templarsRes,
    templarOrderRes,
    artifactsRes,
    playersRes,
    sessionsRes,
    threadsRes,
    worldMapRes,
    partyRes,
    metaRes,
  ]) {
    if (res.error) throw new Error(res.error.message);
  }

  const npcRows = npcsRes.data ?? [];
  const cityNpcRows = npcRows.filter((n) => !n.is_global);
  const globalNpcRows = npcRows.filter((n) => n.is_global);
  const rumorRows = rumorsRes.data ?? [];

  const cities: City[] = (citiesRes.data ?? []).map((row) => ({
    ...cityFromRow(row),
    npcs: cityNpcRows.filter((n) => n.city_id === row.id).map(cityNpcFromRow),
    rumors: rumorRows.filter((r) => r.city_id === row.id).map(rumorFromRow),
  }));

  const globalNpcs: GlobalNpc[] = globalNpcRows.map(globalNpcFromRow);

  const fallback = emptyCampaign();
  const worldMapRow = worldMapRes.data;
  const worldMap: MapData = worldMapRow
    ? {
        background: worldMapRow.background,
        markers: worldMapRow.markers ?? [],
        customImage: worldMapRow.custom_image ?? undefined,
        customImageAspectRatio: worldMapRow.custom_image_aspect_ratio ?? undefined,
      }
    : fallback.worldMap;

  const templarOrderRow = templarOrderRes.data;

  return {
    name: metaRes.data?.name ?? fallback.name,
    worldMap,
    cities,
    templars: {
      members: (templarsRes.data ?? []).map(templarFromRow),
      notes: templarOrderRow?.notes ?? '',
      playerNotes: templarOrderRow?.player_notes ?? '',
    },
    threads: (threadsRes.data ?? []).map(threadFromRow),
    sessions: (sessionsRes.data ?? []).map(sessionFromRow),
    party: {
      hope: partyRes.data?.hope ?? fallback.party.hope,
      fear: partyRes.data?.fear ?? fallback.party.fear,
      players: (playersRes.data ?? []).map(playerFromRow),
    },
    globalNpcs,
    factions: (factionsRes.data ?? []).map(factionFromRow),
    artifacts: (artifactsRes.data ?? []).map(artifactFromRow),
  };
}

// ---------------------------------------------------------------------------
// Cities (+ nested npcs/rumors)
// ---------------------------------------------------------------------------

export async function dbInsertCity(city: City) {
  const { error } = await supabase.from('cities').insert({
    id: city.id,
    name: city.name,
    summary: city.summary,
    gm_secret: city.gmSecret,
    player_notes: city.playerNotes,
    map: city.map,
    morale: city.morale,
    created_at: city.createdAt,
    updated_at: city.updatedAt,
  });
  if (error) logSyncError('insert city', error);
}

export async function dbUpsertCity(city: City) {
  const { error } = await supabase.from('cities').upsert({
    id: city.id,
    name: city.name,
    summary: city.summary,
    gm_secret: city.gmSecret,
    player_notes: city.playerNotes,
    map: city.map,
    morale: city.morale,
    updated_at: city.updatedAt,
  });
  if (error) logSyncError('upsert city', error);
}

export async function dbDeleteCity(id: string) {
  const { error } = await supabase.from('cities').delete().eq('id', id);
  if (error) logSyncError('delete city', error);
}

export async function dbReplaceCityNpcs(cityId: string, npcs: Npc[]) {
  const { error: delErr } = await supabase.from('npcs').delete().eq('city_id', cityId).eq('is_global', false);
  if (delErr) {
    logSyncError('replace city npcs (delete)', delErr);
    return;
  }
  if (npcs.length === 0) return;
  const { error } = await supabase
    .from('npcs')
    .insert(npcs.map((n) => ({ id: n.id, city_id: cityId, is_global: false, name: n.name, role: n.role, description: n.description, secret: n.secret, player_notes: n.playerNotes })));
  if (error) logSyncError('replace city npcs (insert)', error);
}

export async function dbReplaceCityRumors(cityId: string, rumors: Rumor[]) {
  const { error: delErr } = await supabase.from('rumors').delete().eq('city_id', cityId);
  if (delErr) {
    logSyncError('replace city rumors (delete)', delErr);
    return;
  }
  if (rumors.length === 0) return;
  const { error } = await supabase
    .from('rumors')
    .insert(rumors.map((r) => ({ id: r.id, city_id: cityId, text: r.text, status: r.status, source: r.source, notes: r.notes, player_notes: r.playerNotes })));
  if (error) logSyncError('replace city rumors (insert)', error);
}

// ---------------------------------------------------------------------------
// Global NPCs
// ---------------------------------------------------------------------------

export async function dbUpsertGlobalNpc(npc: GlobalNpc) {
  const { error } = await supabase.from('npcs').upsert({
    id: npc.id,
    city_id: npc.cityId ?? null,
    is_global: true,
    name: npc.name,
    role: npc.role,
    description: npc.description,
    secret: npc.secret,
    player_notes: npc.playerNotes,
  });
  if (error) logSyncError('upsert global npc', error);
}

export async function dbDeleteNpc(id: string) {
  const { error } = await supabase.from('npcs').delete().eq('id', id);
  if (error) logSyncError('delete npc', error);
}

// ---------------------------------------------------------------------------
// Factions
// ---------------------------------------------------------------------------

export async function dbUpsertFaction(f: Faction) {
  const { error } = await supabase
    .from('factions')
    .upsert({ id: f.id, city_id: f.cityId ?? null, name: f.name, leader: f.leader, description: f.description, notes: f.notes, player_notes: f.playerNotes });
  if (error) logSyncError('upsert faction', error);
}

export async function dbDeleteFaction(id: string) {
  const { error } = await supabase.from('factions').delete().eq('id', id);
  if (error) logSyncError('delete faction', error);
}

// ---------------------------------------------------------------------------
// Templars
// ---------------------------------------------------------------------------

export async function dbUpsertTemplar(m: TemplarMember) {
  const { error } = await supabase
    .from('templar_members')
    .upsert({ id: m.id, city_id: m.cityId ?? null, name: m.name, status: m.status, description: m.description, gm_secret: m.gmSecret, player_notes: m.playerNotes });
  if (error) logSyncError('upsert templar', error);
}

export async function dbDeleteTemplar(id: string) {
  const { error } = await supabase.from('templar_members').delete().eq('id', id);
  if (error) logSyncError('delete templar', error);
}

export async function dbUpdateTemplarOrder(notes: string, playerNotes: string) {
  const { error } = await supabase.from('templar_order').update({ notes, player_notes: playerNotes }).eq('id', true);
  if (error) logSyncError('update templar order', error);
}

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

export async function dbUpsertArtifact(a: Artifact) {
  const { error } = await supabase.from('artifacts').upsert({
    id: a.id,
    name: a.name,
    description: a.description,
    status: a.status,
    possible_location: a.possibleLocation,
    possible_owner: a.possibleOwner,
    gm_secret: a.gmSecret,
    player_notes: a.playerNotes,
  });
  if (error) logSyncError('upsert artifact', error);
}

export async function dbDeleteArtifact(id: string) {
  const { error } = await supabase.from('artifacts').delete().eq('id', id);
  if (error) logSyncError('delete artifact', error);
}

// ---------------------------------------------------------------------------
// Party characters
// ---------------------------------------------------------------------------

export async function dbUpsertPlayer(p: Player) {
  const { error } = await supabase.from('party_characters').upsert({
    id: p.id,
    player_name: p.playerName,
    char_name: p.charName,
    ancestry_class: p.ancestryClass,
    notes: p.notes,
    gm_secret: p.gmSecret,
    player_notes: p.playerNotes,
    linked_user_id: p.linkedUserId ?? null,
    class_id: p.classId ?? null,
    subclass_id: p.subclassId ?? null,
    level: p.level,
    ancestry_id: p.ancestryId ?? null,
    community_id: p.communityId ?? null,
    primary_weapon_id: p.primaryWeaponId ?? null,
    secondary_weapon_id: p.secondaryWeaponId ?? null,
    armor_id: p.armorId ?? null,
    bonus_evasion: p.bonusEvasion ?? 0,
    bonus_hit_points: p.bonusHitPoints ?? 0,
    bonus_stress: p.bonusStress ?? 0,
    bonus_major_threshold: p.bonusMajorThreshold ?? 0,
    bonus_severe_threshold: p.bonusSevereThreshold ?? 0,
    trait_agility: p.traitAgility ?? 0,
    trait_strength: p.traitStrength ?? 0,
    trait_finesse: p.traitFinesse ?? 0,
    trait_instinct: p.traitInstinct ?? 0,
    trait_presence: p.traitPresence ?? 0,
    trait_knowledge: p.traitKnowledge ?? 0,
    proficiency: p.proficiency,
    marked_hit_points: p.markedHitPoints ?? 0,
    marked_stress: p.markedStress ?? 0,
    marked_armor_slots: p.markedArmorSlots ?? 0,
    hope: p.hope ?? 2,
    hope_max: p.hopeMax ?? 6,
    experiences: p.experiences ?? [],
    multiclass_class_id: p.multiclassClassId ?? null,
    multiclass_subclass_id: p.multiclassSubclassId ?? null,
    multiclass_domain_id: p.multiclassDomainId ?? null,
  });
  if (error) logSyncError('upsert player', error);
}

export async function dbDeletePlayer(id: string) {
  const { error } = await supabase.from('party_characters').delete().eq('id', id);
  if (error) logSyncError('delete player', error);
}

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

export async function dbUpsertThread(t: Thread) {
  const { error } = await supabase
    .from('threads')
    .upsert({ id: t.id, city_id: t.cityId ?? null, title: t.title, status: t.status, description: t.description, updated_at: t.updatedAt });
  if (error) logSyncError('upsert thread', error);
}

export async function dbDeleteThread(id: string) {
  const { error } = await supabase.from('threads').delete().eq('id', id);
  if (error) logSyncError('delete thread', error);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function dbUpsertSession(s: Session) {
  const { error } = await supabase.from('sessions').upsert({ id: s.id, date: s.date, title: s.title, summary: s.summary, hooks: s.hooks, loot_xp: s.lootXp });
  if (error) logSyncError('upsert session', error);
}

export async function dbDeleteSession(id: string) {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) logSyncError('delete session', error);
}

// ---------------------------------------------------------------------------
// Singletons
// ---------------------------------------------------------------------------

export async function dbUpdateWorldMap(map: MapData) {
  const { error } = await supabase
    .from('world_map')
    .update({ background: map.background, markers: map.markers, custom_image: map.customImage ?? null, custom_image_aspect_ratio: map.customImageAspectRatio ?? null })
    .eq('id', true);
  if (error) logSyncError('update world map', error);
}

export async function dbUpdatePartyResources(hope: number, fear: number) {
  const { error } = await supabase.from('party_resources').update({ hope, fear }).eq('id', true);
  if (error) logSyncError('update party resources', error);
}

export async function dbUpdateCampaignName(name: string) {
  const { error } = await supabase.from('campaign_meta').update({ name }).eq('id', true);
  if (error) logSyncError('update campaign name', error);
}
