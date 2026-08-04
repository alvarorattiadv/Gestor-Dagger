import type { Ancestry, Armor, DaggerClass } from './rulesTypes';
import type { Player } from './types';

function evasionModFromArmorFeature(feature: string | undefined): number {
  if (!feature) return 0;
  const m = feature.match(/([+−]\d+)\s+to\s+(?:all character traits and\s+)?Evasion/);
  if (!m) return 0;
  return parseInt(m[1].replace('−', '-'), 10);
}

function ancestryEvasionBonus(ancestry: Ancestry | undefined): number {
  if (!ancestry) return 0;
  let total = 0;
  for (const f of ancestry.features) {
    const m = f.text.match(/permanent\s+([+−]\d+)\s+bonus to your Evasion/);
    if (m) total += parseInt(m[1].replace('−', '-'), 10);
  }
  return total;
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

export interface ThresholdBreakdown {
  source: 'armor' | 'unarmored';
  base: number;
  level: number;
  manual: number;
  total: number;
}

export interface DerivedStats {
  evasion: { base: number; armor: number; ancestry: number; manual: number; total: number };
  hitPoints: { base: number; ancestry: number; manual: number; total: number };
  stressSlots: { ancestry: number; manual: number; total: number };
  majorThreshold: ThresholdBreakdown;
  severeThreshold: ThresholdBreakdown;
  armorScore: number;
}

export function deriveCharacterStats(
  player: Player,
  selectedClass: DaggerClass | undefined,
  selectedArmor: Armor | undefined,
  selectedAncestry: Ancestry | undefined,
): DerivedStats {
  const evasionBase = selectedClass?.startingEvasion ?? 0;
  const evasionArmor = evasionModFromArmorFeature(selectedArmor?.feature);
  const evasionAncestry = ancestryEvasionBonus(selectedAncestry);
  const evasionManual = player.bonusEvasion ?? 0;

  const hpBase = selectedClass?.startingHitPoints ?? 0;
  const hpAncestry = ancestrySlotBonus(selectedAncestry, 'Hit Point');
  const hpManual = player.bonusHitPoints ?? 0;

  const stressAncestry = ancestrySlotBonus(selectedAncestry, 'Stress');
  const stressManual = player.bonusStress ?? 0;

  const majorManual = player.bonusMajorThreshold ?? 0;
  const severeManual = player.bonusSevereThreshold ?? 0;

  // Unarmored rule: Armor Score 0, Major threshold = level, Severe threshold = level x2.
  const majorThreshold: ThresholdBreakdown = selectedArmor
    ? { source: 'armor', base: selectedArmor.majorThreshold, level: player.level, manual: majorManual, total: selectedArmor.majorThreshold + player.level + majorManual }
    : { source: 'unarmored', base: 0, level: player.level, manual: majorManual, total: player.level + majorManual };
  const severeThreshold: ThresholdBreakdown = selectedArmor
    ? { source: 'armor', base: selectedArmor.severeThreshold, level: player.level, manual: severeManual, total: selectedArmor.severeThreshold + player.level + severeManual }
    : { source: 'unarmored', base: 0, level: player.level, manual: severeManual, total: player.level * 2 + severeManual };

  return {
    evasion: { base: evasionBase, armor: evasionArmor, ancestry: evasionAncestry, manual: evasionManual, total: evasionBase + evasionArmor + evasionAncestry + evasionManual },
    hitPoints: { base: hpBase, ancestry: hpAncestry, manual: hpManual, total: hpBase + hpAncestry + hpManual },
    stressSlots: { ancestry: stressAncestry, manual: stressManual, total: stressAncestry + stressManual },
    majorThreshold,
    severeThreshold,
    armorScore: selectedArmor?.baseScore ?? 0,
  };
}
