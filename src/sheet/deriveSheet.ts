import type { Character } from '../types/character';
import type { AbilityKey, SkillKey } from '../types/rules';
import { ABILITY_KEYS, SKILL_INFO } from '../types/rules';
import { getClass } from '../data/classes';
import { getSpecies } from '../data/species';
import { getBackground } from '../data/backgrounds';
import { getItem } from '../data/items';
import { getFeat } from '../data/feats';
import type { Feat } from '../types/feat';
import {
  abilityModifier,
  proficiencyBonus,
  computeArmorClass,
  computeInitiative,
  passiveScore,
  skillModifier,
  savingThrowModifier,
  carryingCapacity,
  spellSaveDC,
  spellAttackBonus,
  spellSlotsForLevel,
  preparedSpellCount,
} from '../engine';

export function abilityScores(character: Character): Record<AbilityKey, number> {
  const result = { ...character.baseAbilityScores };
  for (const key of ABILITY_KEYS) {
    result[key] = character.baseAbilityScores[key] + (character.backgroundAbilityBonuses[key] ?? 0);
  }
  return result;
}

export function abilityModifiers(character: Character): Record<AbilityKey, number> {
  const scores = abilityScores(character);
  const result = {} as Record<AbilityKey, number>;
  for (const key of ABILITY_KEYS) result[key] = abilityModifier(scores[key]);
  return result;
}

export function deriveSheet(character: Character) {
  const classDef = getClass(character.classId);
  const species = getSpecies(character.speciesId);
  const background = getBackground(character.backgroundId);
  if (!classDef || !species || !background) {
    throw new Error('Dados de regras ausentes para este personagem.');
  }

  const scores = abilityScores(character);
  const mods = abilityModifiers(character);
  const profBonus = proficiencyBonus(character.level);

  const feats = character.featIds.map((id) => getFeat(id)).filter((f): f is Feat => Boolean(f));
  const hpBonus =
    feats.reduce((sum, f) => sum + (f.hpBonusPerLevel ?? 0) * character.level, 0) + (species.hpBonusPerLevel ?? 0) * character.level;
  const hpMax = character.hpMax + hpBonus;
  const initiativeProficient = feats.some((f) => f.initiativeProficiency);

  const equippedArmorEntry = character.inventory.find((e) => e.equipped && getItem(e.itemId)?.armor);
  const equippedArmor = equippedArmorEntry ? getItem(equippedArmorEntry.itemId)?.armor : undefined;
  const hasShield = character.inventory.some((e) => e.equipped && getItem(e.itemId)?.category === 'escudo');

  const armorClass = character.armorClassOverride ?? computeArmorClass({ dexMod: mods.dex, equippedArmor, hasShield });
  const initiative = computeInitiative(mods.dex, initiativeProficient ? profBonus : 0);
  const passivePerception = passiveScore(
    mods.wis,
    profBonus,
    character.skillProficiencies.includes('perception'),
    character.skillExpertise.includes('perception'),
  );

  const skills = (Object.keys(SKILL_INFO) as SkillKey[]).map((key) => {
    const info = SKILL_INFO[key];
    const proficient = character.skillProficiencies.includes(key);
    const expertise = character.skillExpertise.includes(key);
    return {
      key,
      label: info.label,
      ability: info.ability,
      proficient,
      expertise,
      modifier: skillModifier(mods[info.ability], profBonus, proficient, expertise),
    };
  });

  const savingThrows = ABILITY_KEYS.map((key) => {
    const proficient = classDef.savingThrowProficiencies.includes(key);
    return {
      key,
      proficient,
      modifier: savingThrowModifier(mods[key], profBonus, proficient),
    };
  });

  const carrying = carryingCapacity(scores.str);

  const spellcasting = classDef.spellcasting
    ? (() => {
        const abilityMod = mods[classDef.spellcasting!.ability];
        return {
          ability: classDef.spellcasting!.ability,
          saveDC: spellSaveDC(profBonus, abilityMod),
          attackBonus: spellAttackBonus(profBonus, abilityMod),
          slots: spellSlotsForLevel(classDef.spellcasting!.progression, character.level),
          cantripsKnown: classDef.spellcasting!.cantripsKnownByLevel[character.level] ?? classDef.spellcasting!.cantripsKnownByLevel[1] ?? 0,
          preparedCount: preparedSpellCount(character.level, abilityMod),
        };
      })()
    : null;

  const subclass = character.subclassId ? classDef.subclasses.find((s) => s.id === character.subclassId) : undefined;

  const activeFeatures = classDef.features.filter((f) => f.level <= character.level);
  const activeSubclassFeatures = subclass ? subclass.features.filter((f) => f.level <= character.level) : [];

  return {
    classDef,
    species,
    background,
    subclass,
    feats,
    scores,
    mods,
    profBonus,
    armorClass,
    equippedArmor,
    hasShield,
    initiative,
    initiativeProficient,
    hpMax,
    hpBonus,
    passivePerception,
    skills,
    savingThrows,
    carrying,
    spellcasting,
    activeFeatures,
    activeSubclassFeatures,
  };
}

export type DerivedSheet = ReturnType<typeof deriveSheet>;
