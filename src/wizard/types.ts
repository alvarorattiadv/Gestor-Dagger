import type { AbilityGenerationMethod, Currency } from '../types/character';
import type { AbilityKey, SkillKey } from '../types/rules';

export interface WizardDraft {
  step: number;
  name: string;
  playerName: string;
  alignment: string;
  speciesId: string;
  lineageId: string;
  classId: string;
  backgroundId: string;
  abilityGenerationMethod: AbilityGenerationMethod;
  baseAbilityScores: Record<AbilityKey, number>;
  backgroundAbilityBonuses: Partial<Record<AbilityKey, number>>;
  classSkillSelections: SkillKey[];
  backgroundEquipmentOptionId: string;
  classEquipmentOptionId: string;
  classChoiceSelections: Record<string, string[]>;
  /** Spell choices keyed by grant source: 'class' for the class's own spellcasting, or a featId for feat-granted access (e.g. Magic Initiate). */
  spellSelections: Record<string, string[]>;
  /** Skill proficiency choices keyed by featId (e.g. Skilled). */
  featSkillSelections: Record<string, SkillKey[]>;
  extraGold: number;
}

export const EMPTY_ABILITY_SCORES: Record<AbilityKey, number> = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

export const DEFAULT_CURRENCY: Currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

export function createEmptyDraft(): WizardDraft {
  return {
    step: 0,
    name: '',
    playerName: '',
    alignment: '',
    speciesId: '',
    lineageId: '',
    classId: '',
    backgroundId: '',
    abilityGenerationMethod: 'standard',
    baseAbilityScores: { ...EMPTY_ABILITY_SCORES },
    backgroundAbilityBonuses: {},
    classSkillSelections: [],
    backgroundEquipmentOptionId: '',
    classEquipmentOptionId: '',
    classChoiceSelections: {},
    spellSelections: {},
    featSkillSelections: {},
    extraGold: 0,
  };
}
