export type MapIconId =
  | 'city'
  | 'village'
  | 'castle'
  | 'mountain'
  | 'forest'
  | 'water'
  | 'ruins'
  | 'cave'
  | 'port'
  | 'temple'
  | 'camp'
  | 'danger'
  | 'poi'
  | 'templarCross';

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  kind: 'icon' | 'text';
  icon?: MapIconId;
  color: string;
  label: string;
  note: string;
  linkCityId?: string;
}

export type MapBackground = 'parchment' | 'grid' | 'plain' | 'dark';

export interface MapData {
  background: MapBackground;
  markers: MapMarker[];
  customImage?: string;
  customImageAspectRatio?: string;
}

export function createEmptyMap(background: MapBackground = 'parchment'): MapData {
  return { background, markers: [] };
}

export interface Npc {
  id: string;
  name: string;
  role: string;
  description: string;
  secret: string;
  playerNotes: string;
}

export type RumorStatus = 'nao-verificado' | 'confirmado' | 'desmentido';

export interface Rumor {
  id: string;
  text: string;
  status: RumorStatus;
  source: string;
  notes: string;
  playerNotes: string;
}

export interface MoraleLogEntry {
  id: string;
  date: string;
  delta: number;
  note: string;
}

export interface Morale {
  score: number;
  notes: string;
  log: MoraleLogEntry[];
}

export interface City {
  id: string;
  name: string;
  summary: string;
  gmSecret: string;
  playerNotes: string;
  map: MapData;
  npcs: Npc[];
  rumors: Rumor[];
  morale: Morale;
  createdAt: string;
  updatedAt: string;
}

export type TemplarStatus = 'grao-mestre' | 'secreto' | 'discreto' | 'suspeito' | 'outro';

export interface TemplarMember {
  id: string;
  name: string;
  status: TemplarStatus;
  description: string;
  gmSecret: string;
  playerNotes: string;
  cityId?: string;
}

export interface TemplarOrder {
  members: TemplarMember[];
  notes: string;
  playerNotes: string;
}

export type ThreadStatus = 'ativo' | 'concluido' | 'esquecido';

export interface Thread {
  id: string;
  title: string;
  status: ThreadStatus;
  description: string;
  cityId?: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  date: string;
  title: string;
  summary: string;
  hooks: string;
  lootXp: string;
}

export interface Player {
  id: string;
  playerName: string;
  charName: string;
  ancestryClass: string;
  notes: string;
  gmSecret: string;
  playerNotes: string;
  linkedUserId?: string;
  classId?: string;
  subclassId?: string;
  level: number;
  ancestryId?: string;
  communityId?: string;
  primaryWeaponId?: string;
  secondaryWeaponId?: string;
  armorId?: string;
}

export interface PartyResources {
  hope: number;
  fear: number;
  players: Player[];
}

export interface GlobalNpc {
  id: string;
  name: string;
  role: string;
  description: string;
  secret: string;
  playerNotes: string;
  cityId?: string;
}

export interface Faction {
  id: string;
  name: string;
  leader: string;
  description: string;
  notes: string;
  playerNotes: string;
  cityId?: string;
}

export type ArtifactStatus = 'confirmado' | 'mito' | 'destruido';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  status: ArtifactStatus;
  possibleLocation: string;
  possibleOwner: string;
  gmSecret: string;
  playerNotes: string;
}

export interface Campaign {
  name: string;
  worldMap: MapData;
  cities: City[];
  templars: TemplarOrder;
  threads: Thread[];
  sessions: Session[];
  party: PartyResources;
  globalNpcs: GlobalNpc[];
  factions: Faction[];
  artifacts: Artifact[];
}

export function emptyCampaign(): Campaign {
  return {
    name: 'Minha Campanha de Daggerheart',
    worldMap: createEmptyMap('parchment'),
    cities: [],
    templars: { members: [], notes: '', playerNotes: '' },
    threads: [],
    sessions: [],
    party: { hope: 2, fear: 0, players: [] },
    globalNpcs: [],
    factions: [],
    artifacts: [],
  };
}

export function emptyCity(name: string): City {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    summary: '',
    gmSecret: '',
    playerNotes: '',
    map: createEmptyMap('parchment'),
    npcs: [],
    rumors: [],
    morale: { score: 50, notes: '', log: [] },
    createdAt: now,
    updatedAt: now,
  };
}
