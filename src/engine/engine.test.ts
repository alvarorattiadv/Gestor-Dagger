import { describe, it, expect } from 'vitest';
import { abilityModifier } from './modifiers';
import { proficiencyBonus } from './proficiency';
import { spellSlotsForLevel, spellSaveDC, spellAttackBonus, preparedSpellCount } from './spellcasting';
import { computeArmorClass, computeInitiative, hpAtLevelOne, averageHpGain, skillModifier, savingThrowModifier, applyDamage, applyHeal } from './combat';
import { pointBuyCost, isValidPointBuy } from './abilityScores';
import { carryingCapacity, pushDragLiftCapacity } from './carrying';

describe('abilityModifier', () => {
  it('computes standard 5e modifiers', () => {
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(11)).toBe(0);
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(15)).toBe(2);
    expect(abilityModifier(20)).toBe(5);
    expect(abilityModifier(1)).toBe(-5);
  });
});

describe('proficiencyBonus', () => {
  it('follows the level progression', () => {
    expect(proficiencyBonus(1)).toBe(2);
    expect(proficiencyBonus(4)).toBe(2);
    expect(proficiencyBonus(5)).toBe(3);
    expect(proficiencyBonus(8)).toBe(3);
    expect(proficiencyBonus(9)).toBe(4);
    expect(proficiencyBonus(13)).toBe(5);
    expect(proficiencyBonus(17)).toBe(6);
    expect(proficiencyBonus(20)).toBe(6);
  });
});

describe('spellSlotsForLevel', () => {
  it('gives a full caster the correct slots at level 1, 3 and 5', () => {
    expect(spellSlotsForLevel('full', 1)).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(spellSlotsForLevel('full', 3)).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0]);
    expect(spellSlotsForLevel('full', 5)).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });

  it('gives no slots for non-casters', () => {
    expect(spellSlotsForLevel('none', 10)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('caps at level 20 table', () => {
    expect(spellSlotsForLevel('full', 20)).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
    expect(spellSlotsForLevel('full', 25)).toEqual(spellSlotsForLevel('full', 20));
  });
});

describe('spell save DC and attack bonus', () => {
  it('applies the 8 + prof + mod formula', () => {
    expect(spellSaveDC(2, 3)).toBe(13);
    expect(spellAttackBonus(2, 3)).toBe(5);
  });
});

describe('preparedSpellCount', () => {
  it('is class level + ability mod, minimum 1', () => {
    expect(preparedSpellCount(1, 3)).toBe(4);
    expect(preparedSpellCount(1, -1)).toBe(1);
    expect(preparedSpellCount(5, 0)).toBe(5);
  });
});

describe('computeArmorClass', () => {
  it('uses 10 + dex when unarmored', () => {
    expect(computeArmorClass({ dexMod: 3 })).toBe(13);
  });

  it('caps dex bonus for medium armor', () => {
    expect(computeArmorClass({ dexMod: 5, equippedArmor: { baseAC: 14, addDexMod: true, maxDexBonus: 2 } })).toBe(16);
  });

  it('ignores dex for heavy armor', () => {
    expect(computeArmorClass({ dexMod: 5, equippedArmor: { baseAC: 16, addDexMod: false } })).toBe(16);
  });

  it('adds shield bonus', () => {
    expect(computeArmorClass({ dexMod: 2, hasShield: true })).toBe(14);
  });
});

describe('computeInitiative', () => {
  it('equals dex mod plus bonuses', () => {
    expect(computeInitiative(2)).toBe(2);
    expect(computeInitiative(2, 5)).toBe(7);
  });
});

describe('hit points', () => {
  it('level one HP is max hit die plus con mod', () => {
    expect(hpAtLevelOne(10, 2)).toBe(12);
  });

  it('average HP gain rounds up half the hit die plus one', () => {
    expect(averageHpGain(6)).toBe(4);
    expect(averageHpGain(8)).toBe(5);
    expect(averageHpGain(10)).toBe(6);
    expect(averageHpGain(12)).toBe(7);
  });
});

describe('skillModifier and savingThrowModifier', () => {
  it('adds proficiency bonus only when proficient, doubles for expertise', () => {
    expect(skillModifier(3, 2, false)).toBe(3);
    expect(skillModifier(3, 2, true)).toBe(5);
    expect(skillModifier(3, 2, true, true)).toBe(7);
    expect(savingThrowModifier(1, 2, true)).toBe(3);
    expect(savingThrowModifier(1, 2, false)).toBe(1);
  });
});

describe('applyDamage', () => {
  it('depletes temp HP before current HP', () => {
    expect(applyDamage({ hpCurrent: 20, hpTemp: 5 }, 3)).toEqual({ hpCurrent: 20, hpTemp: 2 });
  });

  it('spills remaining damage onto current HP once temp HP is exhausted', () => {
    expect(applyDamage({ hpCurrent: 20, hpTemp: 5 }, 8)).toEqual({ hpCurrent: 17, hpTemp: 0 });
  });

  it('floors current HP at 0 and never goes negative', () => {
    expect(applyDamage({ hpCurrent: 5, hpTemp: 0 }, 999)).toEqual({ hpCurrent: 0, hpTemp: 0 });
  });

  it('treats negative damage input as zero', () => {
    expect(applyDamage({ hpCurrent: 10, hpTemp: 0 }, -5)).toEqual({ hpCurrent: 10, hpTemp: 0 });
  });
});

describe('applyHeal', () => {
  it('adds HP without exceeding hpMax', () => {
    expect(applyHeal(10, 26, 8)).toBe(18);
    expect(applyHeal(24, 26, 8)).toBe(26);
  });

  it('treats negative heal input as zero', () => {
    expect(applyHeal(10, 26, -5)).toBe(10);
  });
});

describe('point buy', () => {
  it('computes cost from the standard table', () => {
    expect(pointBuyCost({ str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 })).toBe(27);
  });

  it('rejects budgets over 27 points', () => {
    expect(isValidPointBuy({ str: 15, dex: 15, con: 15, int: 15, wis: 8, cha: 8 })).toBe(false);
    expect(isValidPointBuy({ str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 })).toBe(true);
  });
});

describe('carrying capacity', () => {
  it('multiplies strength score', () => {
    expect(carryingCapacity(14)).toBe(210);
    expect(pushDragLiftCapacity(14)).toBe(420);
  });
});
