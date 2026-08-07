import type { Ancestry, Armor, CharacterAdvancement, DaggerClass, FeatureText, Subclass } from './rulesTypes';
import type { Player } from './types';

function signed(match: string): number {
  return parseInt(match.replace('−', '-'), 10);
}

function countAdvancement(advancements: CharacterAdvancement[], optionId: string): number {
  return advancements.filter((a) => a.optionId === optionId).length;
}

/** "upgraded-subclass-card" picks, split by which subclass they targeted (undefined/'primary' = the character's original subclass). */
function countSubclassCardAdvancement(advancements: CharacterAdvancement[], target: 'primary' | 'multiclass'): number {
  return advancements.filter((a) => a.optionId === 'upgraded-subclass-card' && (a.appliesTo ?? 'primary') === target).length;
}

function evasionModFromArmorFeature(feature: string | undefined): number {
  if (!feature) return 0;
  const m = feature.match(/([+−]\d+)\s+to\s+(?:all character traits and\s+)?Evasion/);
  return m ? signed(m[1]) : 0;
}

/** "Gain a permanent +N bonus to your Evasion" — used for ancestry features and subclass tier features. */
function permanentEvasionFromFeatures(features: FeatureText[] | undefined): number {
  if (!features) return 0;
  let total = 0;
  for (const f of features) {
    const m = f.text.match(/permanent\s+([+−]\d+)\s+bonus to your Evasion/i);
    if (m) total += signed(m[1]);
  }
  return total;
}

/** "Gain a permanent +N bonus to your damage thresholds" (both) or "...to your Severe damage threshold" (severe only). */
function permanentThresholdBonusFromFeatures(features: FeatureText[] | undefined): { major: number; severe: number } {
  let major = 0;
  let severe = 0;
  if (!features) return { major, severe };
  for (const f of features) {
    const both = f.text.match(/permanent\s+([+−]\d+)\s+bonus to your damage thresholds/i);
    if (both) {
      major += signed(both[1]);
      severe += signed(both[1]);
      continue;
    }
    const severeOnly = f.text.match(/permanent\s+([+−]\d+)\s+bonus to your Severe damage threshold/i);
    if (severeOnly) severe += signed(severeOnly[1]);
  }
  return { major, severe };
}

function ancestrySlotBonus(ancestry: Ancestry | undefined, kind: 'Hit Point' | 'Stress'): number {
  if (!ancestry) return 0;
  let total = 0;
  const re = new RegExp(`additional ${kind} slot`, 'i');
  for (const f of ancestry.features) {
    if (re.test(f.text)) total += 1;
  }
  return total;
}

/** Galapa's "Shell": bonus to damage thresholds equal to your Proficiency (both major and severe). */
function ancestryProficiencyThresholdBonus(ancestry: Ancestry | undefined, proficiency: number): number {
  if (!ancestry) return 0;
  const hasIt = ancestry.features.some((f) => /bonus to your damage thresholds equal to your Proficiency/i.test(f.text));
  return hasIt ? proficiency : 0;
}

export function tierForLevel(level: number): number {
  if (level <= 1) return 1;
  if (level <= 4) return 2;
  if (level <= 7) return 3;
  return 4;
}

/** Valor domain card: when unequipped from armor, replaces the generic unarmored formula with a fixed per-tier base. Still gets +level, same as armor. */
const BARE_BONES_THRESHOLDS: Record<number, { major: number; severe: number }> = {
  1: { major: 9, severe: 19 },
  2: { major: 11, severe: 24 },
  3: { major: 13, severe: 31 },
  4: { major: 15, severe: 38 },
};

export interface ThresholdBreakdown {
  source: 'armor' | 'unarmored' | 'bare-bones';
  base: number;
  level: number;
  /** Subclass tier features (foundation always, specialization/mastery once taken via a logged advancement) + ancestry bonus tied to Proficiency (e.g. Galapa's Shell). */
  autoBonus: number;
  manual: number;
  total: number;
}

export interface DerivedStats {
  evasion: { base: number; armor: number; ancestry: number; subclass: number; advancements: number; manual: number; total: number };
  hitPoints: { base: number; ancestry: number; advancements: number; manual: number; total: number };
  stressSlots: { ancestry: number; advancements: number; manual: number; total: number };
  majorThreshold: ThresholdBreakdown;
  severeThreshold: ThresholdBreakdown;
  armorScore: number;
  armorScoreNote: string | null;
  /** Permanent bonuses that exist in the rules text but can't be safely auto-applied (depend on an untracked base trait, or the relevant advancement hasn't been logged yet). */
  reminders: string[];
}

export function deriveCharacterStats(
  player: Player,
  selectedClass: DaggerClass | undefined,
  selectedArmor: Armor | undefined,
  selectedAncestry: Ancestry | undefined,
  selectedSubclass: Subclass | undefined,
  hasBareBones: boolean,
  advancements: CharacterAdvancement[],
  multiclassSubclass?: Subclass,
): DerivedStats {
  const primarySubclassCardCount = countSubclassCardAdvancement(advancements, 'primary');
  const hasSpecialization = primarySubclassCardCount >= 1;
  const hasMastery = primarySubclassCardCount >= 2;

  // The multiclass subclass can be pushed to specialization via its own "upgraded subclass card" picks, but never mastery.
  const multiclassCardCount = countSubclassCardAdvancement(advancements, 'multiclass');
  const hasMulticlassSpecialization = multiclassCardCount >= 1;

  const subclassTierFeatures: FeatureText[] = [
    ...(selectedSubclass ? [...selectedSubclass.foundation, ...(hasSpecialization ? selectedSubclass.specialization : []), ...(hasMastery ? selectedSubclass.mastery : [])] : []),
    ...(multiclassSubclass ? [...multiclassSubclass.foundation, ...(hasMulticlassSpecialization ? multiclassSubclass.specialization : [])] : []),
  ];

  const evasionBase = selectedClass?.startingEvasion ?? 0;
  const evasionArmor = evasionModFromArmorFeature(selectedArmor?.feature);
  const evasionAncestry = permanentEvasionFromFeatures(selectedAncestry?.features);
  const evasionSubclass = permanentEvasionFromFeatures(subclassTierFeatures);
  const evasionAdvancements = countAdvancement(advancements, 'raise-evasion');
  const evasionManual = player.bonusEvasion ?? 0;

  const hpBase = selectedClass?.startingHitPoints ?? 0;
  const hpAncestry = ancestrySlotBonus(selectedAncestry, 'Hit Point');
  const hpAdvancements = countAdvancement(advancements, 'hit-point-slot');
  const hpManual = player.bonusHitPoints ?? 0;

  const stressAncestry = ancestrySlotBonus(selectedAncestry, 'Stress');
  const stressAdvancements = countAdvancement(advancements, 'stress-slot');
  const stressManual = player.bonusStress ?? 0;

  const majorManual = player.bonusMajorThreshold ?? 0;
  const severeManual = player.bonusSevereThreshold ?? 0;
  const proficiency = player.proficiency ?? 1;
  const subclassThresholds = permanentThresholdBonusFromFeatures(subclassTierFeatures);
  const ancestryThresholdBonus = ancestryProficiencyThresholdBonus(selectedAncestry, proficiency);
  const bonusThresholdMajor = subclassThresholds.major + ancestryThresholdBonus;
  const bonusThresholdSevere = subclassThresholds.severe + ancestryThresholdBonus;
  const useBareBones = !selectedArmor && hasBareBones;
  const bareBonesTable = BARE_BONES_THRESHOLDS[tierForLevel(player.level)];

  let majorThreshold: ThresholdBreakdown;
  let severeThreshold: ThresholdBreakdown;
  let armorScore: number;
  let armorScoreNote: string | null = null;

  if (selectedArmor) {
    majorThreshold = {
      source: 'armor',
      base: selectedArmor.majorThreshold,
      level: player.level,
      autoBonus: bonusThresholdMajor,
      manual: majorManual,
      total: selectedArmor.majorThreshold + player.level + bonusThresholdMajor + majorManual,
    };
    severeThreshold = {
      source: 'armor',
      base: selectedArmor.severeThreshold,
      level: player.level,
      autoBonus: bonusThresholdSevere,
      manual: severeManual,
      total: selectedArmor.severeThreshold + player.level + bonusThresholdSevere + severeManual,
    };
    armorScore = selectedArmor.baseScore;
  } else if (useBareBones) {
    // Bare Bones (Valor, level 1): fixed per-tier base instead of armor's printed thresholds — level and other bonuses still apply on top, same as armor.
    majorThreshold = {
      source: 'bare-bones',
      base: bareBonesTable.major,
      level: player.level,
      autoBonus: bonusThresholdMajor,
      manual: majorManual,
      total: bareBonesTable.major + player.level + bonusThresholdMajor + majorManual,
    };
    severeThreshold = {
      source: 'bare-bones',
      base: bareBonesTable.severe,
      level: player.level,
      autoBonus: bonusThresholdSevere,
      manual: severeManual,
      total: bareBonesTable.severe + player.level + bonusThresholdSevere + severeManual,
    };
    armorScore = 3 + (player.traitStrength ?? 0);
    armorScoreNote = `Bare Bones: Score = 3 (base) + ${player.traitStrength ?? 0} (Força).`;
  } else {
    // Generic unarmored rule: Armor Score 0, Major threshold = level, Severe threshold = level x2.
    majorThreshold = {
      source: 'unarmored',
      base: 0,
      level: player.level,
      autoBonus: bonusThresholdMajor,
      manual: majorManual,
      total: player.level + bonusThresholdMajor + majorManual,
    };
    severeThreshold = {
      source: 'unarmored',
      base: 0,
      level: player.level,
      autoBonus: bonusThresholdSevere,
      manual: severeManual,
      total: player.level * 2 + bonusThresholdSevere + severeManual,
    };
    armorScore = 0;
  }

  const reminders: string[] = [];
  if (selectedAncestry) {
    for (const f of selectedAncestry.features) {
      const alreadyHandled =
        /permanent\s+[+−]\d+\s+bonus to your damage thresholds/i.test(f.text) || /bonus to your damage thresholds equal to your Proficiency/i.test(f.text);
      if (/damage threshold/i.test(f.text) && !alreadyHandled) {
        reminders.push(`Ancestralidade (${selectedAncestry.name}) — ${f.name}: ${f.text}`);
      }
    }
  }
  if (selectedSubclass) {
    const tiersToCheck: Array<{ key: 'specialization' | 'mastery'; unlocked: boolean; label: string }> = [
      { key: 'specialization', unlocked: hasSpecialization, label: 'especialização' },
      { key: 'mastery', unlocked: hasMastery, label: 'maestria' },
    ];
    for (const { key, unlocked, label } of tiersToCheck) {
      if (unlocked) continue;
      for (const f of selectedSubclass[key]) {
        if (/permanent\s+[+−]\d+\s+bonus to your (damage thresholds|Evasion|Severe damage threshold)/i.test(f.text)) {
          reminders.push(`${selectedSubclass.name} (${label}, registre o avanço "Carta de subclasse melhorada" ao subir de nível para ativar) — ${f.name}: ${f.text}`);
        }
      }
    }
  }
  if (multiclassSubclass && !hasMulticlassSpecialization) {
    for (const f of multiclassSubclass.specialization) {
      if (/permanent\s+[+−]\d+\s+bonus to your (damage thresholds|Evasion|Severe damage threshold)/i.test(f.text)) {
        reminders.push(
          `${multiclassSubclass.name} — multiclasse (especialização, registre o avanço "Carta de subclasse melhorada" marcando "Multiclasse" para ativar; nunca chega a maestria) — ${f.name}: ${f.text}`,
        );
      }
    }
  }

  return {
    evasion: {
      base: evasionBase,
      armor: evasionArmor,
      ancestry: evasionAncestry,
      subclass: evasionSubclass,
      advancements: evasionAdvancements,
      manual: evasionManual,
      total: evasionBase + evasionArmor + evasionAncestry + evasionSubclass + evasionAdvancements + evasionManual,
    },
    hitPoints: { base: hpBase, ancestry: hpAncestry, advancements: hpAdvancements, manual: hpManual, total: hpBase + hpAncestry + hpAdvancements + hpManual },
    stressSlots: { ancestry: stressAncestry, advancements: stressAdvancements, manual: stressManual, total: stressAncestry + stressAdvancements + stressManual },
    majorThreshold,
    severeThreshold,
    armorScore,
    armorScoreNote,
    reminders,
  };
}
