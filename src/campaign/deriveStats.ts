import type { Ancestry, Armor, DaggerClass, FeatureText, Subclass } from './rulesTypes';
import type { Player } from './types';

function signed(match: string): number {
  return parseInt(match.replace('−', '-'), 10);
}

function evasionModFromArmorFeature(feature: string | undefined): number {
  if (!feature) return 0;
  const m = feature.match(/([+−]\d+)\s+to\s+(?:all character traits and\s+)?Evasion/);
  return m ? signed(m[1]) : 0;
}

/** "Gain a permanent +N bonus to your Evasion" — used for ancestry features and subclass foundation features. */
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
  subclassFoundation: number;
  manual: number;
  total: number;
}

export interface DerivedStats {
  evasion: { base: number; armor: number; ancestry: number; subclassFoundation: number; manual: number; total: number };
  hitPoints: { base: number; ancestry: number; manual: number; total: number };
  stressSlots: { ancestry: number; manual: number; total: number };
  majorThreshold: ThresholdBreakdown;
  severeThreshold: ThresholdBreakdown;
  armorScore: number;
  armorScoreNote: string | null;
  /** Permanent bonuses that exist in the rules text but can't be safely auto-applied (require a level-up choice not yet tracked, or depend on an untracked base trait like Proficiency/Strength). */
  reminders: string[];
}

export function deriveCharacterStats(
  player: Player,
  selectedClass: DaggerClass | undefined,
  selectedArmor: Armor | undefined,
  selectedAncestry: Ancestry | undefined,
  selectedSubclass: Subclass | undefined,
  hasBareBones: boolean,
): DerivedStats {
  const evasionBase = selectedClass?.startingEvasion ?? 0;
  const evasionArmor = evasionModFromArmorFeature(selectedArmor?.feature);
  const evasionAncestry = permanentEvasionFromFeatures(selectedAncestry?.features);
  // Foundation features are always active once a subclass is chosen — no level-up choice required.
  const evasionSubclass = permanentEvasionFromFeatures(selectedSubclass?.foundation);
  const evasionManual = player.bonusEvasion ?? 0;

  const hpBase = selectedClass?.startingHitPoints ?? 0;
  const hpAncestry = ancestrySlotBonus(selectedAncestry, 'Hit Point');
  const hpManual = player.bonusHitPoints ?? 0;

  const stressAncestry = ancestrySlotBonus(selectedAncestry, 'Stress');
  const stressManual = player.bonusStress ?? 0;

  const majorManual = player.bonusMajorThreshold ?? 0;
  const severeManual = player.bonusSevereThreshold ?? 0;
  const subclassThresholds = permanentThresholdBonusFromFeatures(selectedSubclass?.foundation);
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
      subclassFoundation: subclassThresholds.major,
      manual: majorManual,
      total: selectedArmor.majorThreshold + player.level + subclassThresholds.major + majorManual,
    };
    severeThreshold = {
      source: 'armor',
      base: selectedArmor.severeThreshold,
      level: player.level,
      subclassFoundation: subclassThresholds.severe,
      manual: severeManual,
      total: selectedArmor.severeThreshold + player.level + subclassThresholds.severe + severeManual,
    };
    armorScore = selectedArmor.baseScore;
  } else if (useBareBones) {
    // Bare Bones (Valor, level 1): fixed per-tier base instead of armor's printed thresholds — level and subclass bonuses still apply on top, same as armor.
    majorThreshold = {
      source: 'bare-bones',
      base: bareBonesTable.major,
      level: player.level,
      subclassFoundation: subclassThresholds.major,
      manual: majorManual,
      total: bareBonesTable.major + player.level + subclassThresholds.major + majorManual,
    };
    severeThreshold = {
      source: 'bare-bones',
      base: bareBonesTable.severe,
      level: player.level,
      subclassFoundation: subclassThresholds.severe,
      manual: severeManual,
      total: bareBonesTable.severe + player.level + subclassThresholds.severe + severeManual,
    };
    armorScore = 3;
    armorScoreNote = 'Bare Bones: Score base 3 + Força (some manualmente — Força não é rastreada na ficha ainda).';
  } else {
    // Generic unarmored rule: Armor Score 0, Major threshold = level, Severe threshold = level x2.
    majorThreshold = {
      source: 'unarmored',
      base: 0,
      level: player.level,
      subclassFoundation: subclassThresholds.major,
      manual: majorManual,
      total: player.level + subclassThresholds.major + majorManual,
    };
    severeThreshold = {
      source: 'unarmored',
      base: 0,
      level: player.level,
      subclassFoundation: subclassThresholds.severe,
      manual: severeManual,
      total: player.level * 2 + subclassThresholds.severe + severeManual,
    };
    armorScore = 0;
  }

  const reminders: string[] = [];
  if (selectedAncestry) {
    for (const f of selectedAncestry.features) {
      if (/damage threshold/i.test(f.text) && !/permanent\s+[+−]\d+\s+bonus to your damage thresholds/i.test(f.text)) {
        reminders.push(`Ancestralidade (${selectedAncestry.name}) — ${f.name}: ${f.text}`);
      }
    }
  }
  if (selectedSubclass) {
    for (const tierName of ['specialization', 'mastery'] as const) {
      for (const f of selectedSubclass[tierName]) {
        if (/permanent\s+[+−]\d+\s+bonus to your (damage thresholds|Evasion|Severe damage threshold)/i.test(f.text)) {
          const label = tierName === 'specialization' ? 'especialização' : 'maestria';
          reminders.push(`${selectedSubclass.name} (${label}, precisa ter sido pega ao subir de nível) — ${f.name}: ${f.text}`);
        }
      }
    }
  }

  return {
    evasion: { base: evasionBase, armor: evasionArmor, ancestry: evasionAncestry, subclassFoundation: evasionSubclass, manual: evasionManual, total: evasionBase + evasionArmor + evasionAncestry + evasionSubclass + evasionManual },
    hitPoints: { base: hpBase, ancestry: hpAncestry, manual: hpManual, total: hpBase + hpAncestry + hpManual },
    stressSlots: { ancestry: stressAncestry, manual: stressManual, total: stressAncestry + stressManual },
    majorThreshold,
    severeThreshold,
    armorScore,
    armorScoreNote,
    reminders,
  };
}
