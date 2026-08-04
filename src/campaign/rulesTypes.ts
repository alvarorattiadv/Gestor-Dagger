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

export interface DaggerheartRules {
  domains: Domain[];
  classes: DaggerClass[];
  subclasses: Subclass[];
  domainCards: DomainCard[];
  ancestries: Ancestry[];
  communities: Community[];
  weapons: Weapon[];
  armors: Armor[];
}
