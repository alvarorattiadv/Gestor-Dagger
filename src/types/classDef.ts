import type { AbilityKey, CasterProgression, SkillKey } from './rules';

export interface FeatureChoiceOption {
  id: string;
  label: string;
  description?: string;
}

export interface FeatureChoice {
  id: string;
  label: string;
  count: number;
  options: FeatureChoiceOption[];
}

export type ActionType = 'acao' | 'acao-bonus' | 'reacao';

export interface ClassFeature {
  id: string;
  level: number;
  name: string;
  description: string;
  choice?: FeatureChoice;
  actionType?: ActionType;
}

export interface Subclass {
  id: string;
  name: string;
  description: string;
  features: ClassFeature[];
}

export interface EquipmentGrant {
  itemId?: string;
  quantity?: number;
  gold?: number;
  label: string;
}

export interface EquipmentOption {
  id: string;
  label: string;
  grants: EquipmentGrant[];
}

export interface SpellcastingDef {
  ability: AbilityKey;
  progression: CasterProgression;
  style: 'prepared' | 'known';
  cantripsKnownByLevel: Record<number, number>;
  spellsKnownByLevel?: Record<number, number>;
  spellListIds: string[];
}

export interface ClassDef {
  id: string;
  name: string;
  description: string;
  hitDie: number;
  primaryAbilities: AbilityKey[];
  savingThrowProficiencies: AbilityKey[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoiceCount: number;
  skillChoices: SkillKey[];
  startingEquipmentOptions: EquipmentOption[];
  subclassLevel: number;
  subclasses: Subclass[];
  features: ClassFeature[];
  spellcasting?: SpellcastingDef;
  abilityScoreImprovementLevels: number[];
}
