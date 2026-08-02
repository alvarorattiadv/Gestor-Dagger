import type { CasterProgression } from '../types/rules';

/** Spell slots by character level (index 0 = level 1) for a full caster. Index within row = slot level 1-9. */
export const FULL_CASTER_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/** Half casters (e.g. Paladin/Ranger) round the effective level down; approximate table using floor(level/2). */
const HALF_CASTER_LEVEL_MAP = (level: number) => Math.max(0, Math.floor(level / 2));
/** Third casters (e.g. Eldritch Knight/Arcane Trickster) use floor(level/3). */
const THIRD_CASTER_LEVEL_MAP = (level: number) => Math.max(0, Math.floor(level / 3));

export function spellSlotsForLevel(progression: CasterProgression, level: number): number[] {
  if (progression === 'none') return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (progression === 'full') return FULL_CASTER_SLOTS[Math.min(level, 20) - 1] ?? FULL_CASTER_SLOTS[19];
  if (progression === 'half') {
    const effective = HALF_CASTER_LEVEL_MAP(level);
    return effective === 0 ? [0, 0, 0, 0, 0, 0, 0, 0, 0] : FULL_CASTER_SLOTS[Math.min(effective, 20) - 1];
  }
  const effective = THIRD_CASTER_LEVEL_MAP(level);
  return effective === 0 ? [0, 0, 0, 0, 0, 0, 0, 0, 0] : FULL_CASTER_SLOTS[Math.min(effective, 20) - 1];
}

export function spellSaveDC(profBonus: number, abilityMod: number): number {
  return 8 + profBonus + abilityMod;
}

export function spellAttackBonus(profBonus: number, abilityMod: number): number {
  return profBonus + abilityMod;
}

/** 2024 rule for prepared casters: class level + spellcasting ability modifier, minimum 1. */
export function preparedSpellCount(classLevel: number, abilityMod: number): number {
  return Math.max(1, classLevel + abilityMod);
}
