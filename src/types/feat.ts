import type { AbilityKey } from './rules';

export interface FeatSpellGrant {
  /** Spellcasting ability used for the granted spells. */
  ability: AbilityKey;
  /** Which class spell list(s) the choices come from. */
  spellListIds: string[];
  /** How many cantrips the feat grants a choice of. */
  cantripsCount: number;
  /** How many leveled spells the feat grants a choice of. */
  spellsCount: number;
  /** Highest spell level selectable. */
  maxSpellLevel: number;
}

export interface FeatSkillGrant {
  /** How many skill proficiencies the feat lets the player choose. */
  count: number;
}

export interface FeatResourceGrant {
  /** Display name of the resource, e.g. "Pontos de Sorte". */
  label: string;
  /** How many uses the character has. */
  count: number;
}

export interface Feat {
  id: string;
  name: string;
  category: 'origem' | 'geral' | 'epico';
  prerequisite?: string;
  description: string;
  abilityBonusChoice?: {
    abilities: AbilityKey[];
    amount: number;
  };
  spellGrant?: FeatSpellGrant;
  /** Flat HP bonus per character level (e.g. Tough: 2), recalculated live as level changes. */
  hpBonusPerLevel?: number;
  /** Adds proficiency bonus to initiative rolls (2024 Alert). */
  initiativeProficiency?: boolean;
  skillGrant?: FeatSkillGrant;
  resourceGrant?: FeatResourceGrant;
}
