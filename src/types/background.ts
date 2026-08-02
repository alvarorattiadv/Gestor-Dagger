import type { AbilityKey, SkillKey } from './rules';

export interface AbilityBonusChoice {
  /** Ability keys the player may distribute bonuses among. */
  abilities: AbilityKey[];
  /** e.g. [2, 1] means +2 to one and +1 to another; [1, 1, 1] means +1 to three. */
  distribution: number[];
}

export interface Background {
  id: string;
  name: string;
  description: string;
  abilityBonusChoice: AbilityBonusChoice;
  skillProficiencies: SkillKey[];
  toolProficiency: string;
  featId: string;
  equipmentOptions: { id: string; label: string; itemIds: string[]; gold: number }[];
}
