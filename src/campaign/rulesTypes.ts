export interface FeatureText {
  name: string;
  text: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
}

export interface DaggerClass {
  id: string;
  name: string;
  description: string;
  domain1: string;
  domain2: string;
  startingEvasion: number;
  startingHitPoints: number;
  classItems: string;
  hopeFeature: { name: string; cost: number; text: string };
  classFeatures: FeatureText[];
  backgroundQuestions: string[];
  connections: string[];
}

export interface Subclass {
  id: string;
  classId: string;
  name: string;
  blurb: string;
  spellcastTrait: string | null;
  foundation: FeatureText[];
  specialization: FeatureText[];
  mastery: FeatureText[];
}

export type DomainCardType = 'Ability' | 'Spell' | 'Grimoire';

export interface DomainCard {
  id: string;
  name: string;
  domain: string;
  level: number;
  type: DomainCardType;
  recallCost: number;
  description: string;
}

export interface Ancestry {
  id: string;
  name: string;
  description: string;
  features: FeatureText[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  adjectives: string[];
  feature: FeatureText;
}

export type WeaponTableType = 'primary' | 'secondary';
export type WeaponCategory = 'Physical' | 'Magic';

export interface Weapon {
  id: string;
  tableType: WeaponTableType;
  tier: number;
  category: WeaponCategory | null;
  name: string;
  trait: string;
  range: string;
  damage: string;
  burden: string;
  feature: string;
}

export interface Armor {
  id: string;
  tier: number;
  name: string;
  majorThreshold: number;
  severeThreshold: number;
  baseScore: number;
  feature: string;
}

export interface CharacterDomainCard {
  id: string;
  characterId: string;
  domainCardId: string;
  inLoadout: boolean;
}

export interface BeastformOption {
  id: string;
  tier: number;
  name: string;
  examples: string;
  traitBonus: string | null;
  evasionBonus: number | null;
  attack: string | null;
  advantages: string[];
  features: FeatureText[];
}

export interface AdvancementOption {
  id: string;
  name: string;
  slotCost: number;
  description: string;
  minTier: number;
}

export interface CompanionOption {
  id: string;
  name: string;
  description: string;
}

export interface CompanionAdvancement {
  level: number;
  optionId: string;
  detail: string;
}

export type AdvancementTarget = 'primary' | 'multiclass';

export interface CharacterAdvancement {
  id: string;
  characterId: string;
  level: number;
  optionId: string;
  detail: string;
  createdAt: string;
  /** Only meaningful for the "upgraded-subclass-card" option: which subclass this pick advanced. Undefined = primary. */
  appliesTo?: AdvancementTarget;
}

export interface DaggerheartRules {
  domains: Domain[];
  classes: DaggerClass[];
  subclasses: Subclass[];
  domainCards: DomainCard[];
  ancestries: Ancestry[];
  communities: Community[];
  weapons: Weapon[];
  armors: Armor[];
  advancementOptions: AdvancementOption[];
  beastformOptions: BeastformOption[];
  companionOptions: CompanionOption[];
}
