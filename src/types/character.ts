import type { AbilityKey, SkillKey } from './rules';

export type AbilityGenerationMethod = 'standard' | 'pointbuy' | 'manual';

export interface InventoryEntry {
  itemId: string;
  quantity: number;
  equipped: boolean;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface LevelUpRecord {
  level: number;
  hpRolled: number;
  abilityScoreImprovement?: {
    type: 'ability' | 'feat';
    abilityIncreases?: Partial<Record<AbilityKey, number>>;
    featId?: string;
  };
  subclassId?: string;
  choiceSelections?: Record<string, string[]>;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  speciesId: string;
  lineageId?: string;
  classId: string;
  subclassId?: string;
  backgroundId: string;
  alignment: string;
  playerName: string;

  abilityGenerationMethod: AbilityGenerationMethod;
  baseAbilityScores: Record<AbilityKey, number>;
  backgroundAbilityBonuses: Partial<Record<AbilityKey, number>>;

  skillProficiencies: SkillKey[];
  skillExpertise: SkillKey[];
  toolProficiencies: string[];
  languages: string[];

  featIds: string[];
  classChoiceSelections: Record<string, string[]>;

  hpMax: number;
  hpCurrent: number;
  hpTemp: number;
  hitDiceUsed: number;
  useAverageHp: boolean;

  armorClassOverride?: number;
  inventory: InventoryEntry[];
  currency: Currency;

  preparedSpellIds: string[];
  knownSpellIds: string[];
  /** Spells granted by feats (e.g. Magic Initiate) rather than the class's own spellcasting, keyed by featId. */
  featSpellSelections: Record<string, string[]>;
  spellSlotsUsed: Record<number, number>;
  /** Uses spent of a feat-granted resource (e.g. Lucky's luck points), keyed by featId. */
  featResourcesUsed: Record<string, number>;

  levelHistory: LevelUpRecord[];

  notes: string;
  createdAt: string;
  updatedAt: string;
}
