import type { ArmorProps } from '../types/item';

export interface ArmorClassInput {
  dexMod: number;
  equippedArmor?: ArmorProps;
  hasShield?: boolean;
  unarmoredBonus?: number;
  otherBonus?: number;
}

export function computeArmorClass(input: ArmorClassInput): number {
  const { dexMod, equippedArmor, hasShield, unarmoredBonus = 0, otherBonus = 0 } = input;
  let base: number;
  if (equippedArmor) {
    const dexContribution = equippedArmor.addDexMod
      ? Math.min(dexMod, equippedArmor.maxDexBonus ?? Infinity)
      : 0;
    base = equippedArmor.baseAC + dexContribution;
  } else {
    base = 10 + dexMod + unarmoredBonus;
  }
  return base + (hasShield ? 2 : 0) + otherBonus;
}

export function computeInitiative(dexMod: number, bonus = 0): number {
  return dexMod + bonus;
}

export function averageHpGain(hitDie: number): number {
  return Math.floor(hitDie / 2) + 1;
}

export function hpAtLevelOne(hitDie: number, conMod: number): number {
  return hitDie + conMod;
}

export function passiveScore(
  abilityMod: number,
  profBonus: number,
  proficient: boolean,
  expertise = false,
  otherBonus = 0,
): number {
  const profTerm = proficient ? profBonus * (expertise ? 2 : 1) : 0;
  return 10 + abilityMod + profTerm + otherBonus;
}

export function skillModifier(
  abilityMod: number,
  profBonus: number,
  proficient: boolean,
  expertise = false,
): number {
  const profTerm = proficient ? profBonus * (expertise ? 2 : 1) : 0;
  return abilityMod + profTerm;
}

export function savingThrowModifier(abilityMod: number, profBonus: number, proficient: boolean): number {
  return abilityMod + (proficient ? profBonus : 0);
}

export interface HpState {
  hpCurrent: number;
  hpTemp: number;
}

/** Damage first depletes temporary HP, then current HP, floored at 0. */
export function applyDamage(state: HpState, amount: number): HpState {
  const dmg = Math.max(0, amount);
  const tempAfter = Math.max(0, state.hpTemp - dmg);
  const remaining = Math.max(0, dmg - state.hpTemp);
  const hpCurrent = Math.max(0, state.hpCurrent - remaining);
  return { hpCurrent, hpTemp: tempAfter };
}

/** Healing cannot raise current HP above hpMax and never revives from 0 on its own. */
export function applyHeal(hpCurrent: number, hpMax: number, amount: number): number {
  return Math.min(hpMax, hpCurrent + Math.max(0, amount));
}
