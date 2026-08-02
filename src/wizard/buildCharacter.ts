import type { WizardDraft } from './types';
import type { Character, InventoryEntry } from '../types/character';
import type { AbilityKey } from '../types/rules';
import { ABILITY_KEYS } from '../types/rules';
import { getClass } from '../data/classes';
import { getBackground } from '../data/backgrounds';
import { getFeat } from '../data/feats';
import { getSpell } from '../data/spells';
import { abilityModifier, hpAtLevelOne } from '../engine';

function leveledSpellIds(ids: string[]): string[] {
  return ids.filter((id) => (getSpell(id)?.level ?? 0) > 0);
}

export function finalAbilityScores(draft: WizardDraft): Record<AbilityKey, number> {
  const result = { ...draft.baseAbilityScores };
  for (const key of ABILITY_KEYS) {
    result[key] = draft.baseAbilityScores[key] + (draft.backgroundAbilityBonuses[key] ?? 0);
  }
  return result;
}

export function buildCharacter(draft: WizardDraft): Character {
  const classDef = getClass(draft.classId);
  const background = getBackground(draft.backgroundId);
  if (!classDef || !background) {
    throw new Error('Classe ou antecedente inválido ao montar o personagem.');
  }

  const scores = finalAbilityScores(draft);
  const conMod = abilityModifier(scores.con);
  const hpMax = hpAtLevelOne(classDef.hitDie, conMod);

  const inventory: InventoryEntry[] = [];
  const addItem = (itemId: string | undefined, quantity: number) => {
    if (!itemId) return;
    const existing = inventory.find((entry) => entry.itemId === itemId);
    if (existing) existing.quantity += quantity;
    else inventory.push({ itemId, quantity, equipped: false });
  };

  const classOption = classDef.startingEquipmentOptions.find((o) => o.id === draft.classEquipmentOptionId);
  classOption?.grants.forEach((grant) => addItem(grant.itemId, grant.quantity ?? 1));

  const bgOption = background.equipmentOptions.find((o) => o.id === draft.backgroundEquipmentOptionId);
  bgOption?.itemIds.forEach((itemId) => addItem(itemId, 1));

  const goldTotal = (bgOption?.gold ?? 0) + draft.extraGold;

  const skillExpertise = draft.classChoiceSelections['especializacao'] ?? [];

  const now = new Date().toISOString();

  const isFirstLevelSubclass = classDef.subclassLevel === 1;

  const classSpellSelections = draft.spellSelections['class'] ?? [];
  const featSpellSelections: Record<string, string[]> = {};
  if (getFeat(background.featId)?.spellGrant) {
    featSpellSelections[background.featId] = draft.spellSelections[background.featId] ?? [];
  }
  const allSelectedSpellIds = [...classSpellSelections, ...Object.values(featSpellSelections).flat()];

  const featSkillGrant = getFeat(background.featId)?.skillGrant;
  const featSkillSelections = featSkillGrant ? (draft.featSkillSelections[background.featId] ?? []) : [];

  return {
    id: crypto.randomUUID(),
    name: draft.name || 'Personagem sem nome',
    level: 1,
    speciesId: draft.speciesId,
    lineageId: draft.lineageId || undefined,
    classId: draft.classId,
    subclassId: isFirstLevelSubclass ? classDef.subclasses[0]?.id : undefined,
    backgroundId: draft.backgroundId,
    alignment: draft.alignment,
    playerName: draft.playerName,

    abilityGenerationMethod: draft.abilityGenerationMethod,
    baseAbilityScores: draft.baseAbilityScores,
    backgroundAbilityBonuses: draft.backgroundAbilityBonuses,

    skillProficiencies: [...new Set([...background.skillProficiencies, ...draft.classSkillSelections, ...featSkillSelections])] as Character['skillProficiencies'],
    skillExpertise: skillExpertise as Character['skillExpertise'],
    toolProficiencies: [background.toolProficiency],
    languages: ['Comum'],

    featIds: [background.featId],
    classChoiceSelections: draft.classChoiceSelections,

    hpMax,
    hpCurrent: hpMax,
    hpTemp: 0,
    hitDiceUsed: 0,
    useAverageHp: true,

    inventory,
    currency: { cp: 0, sp: 0, ep: 0, gp: goldTotal, pp: 0 },

    preparedSpellIds: leveledSpellIds(classSpellSelections),
    knownSpellIds: [...new Set(allSelectedSpellIds)],
    featSpellSelections,
    spellSlotsUsed: {},
    featResourcesUsed: {},

    levelHistory: [
      {
        level: 1,
        hpRolled: hpMax,
        subclassId: isFirstLevelSubclass ? classDef.subclasses[0]?.id : undefined,
      },
    ],

    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}
