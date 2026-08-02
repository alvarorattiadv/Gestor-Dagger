import type { ClassDef } from '../types/classDef';
import type { AbilityKey } from '../types/rules';
import { getFeat } from './feats';
import { preparedSpellCount } from '../engine/spellcasting';

/**
 * A single independent pool of spell choices a character has to make: the class's own
 * spellcasting, or a feat (e.g. Magic Initiate) that grants access to another list.
 * Any future feat/species trait that grants spell choices only needs to populate
 * `spellGrant` in its data entry — the wizard and character sheet pick it up automatically.
 */
export interface SpellGrantSource {
  key: string;
  label: string;
  ability: AbilityKey;
  spellListIds: string[];
  cantripsCount: number;
  spellsCount: number;
  maxSpellLevel: number;
}

export function classSpellGrantSource(classDef: ClassDef | undefined, level: number, abilityMod: number): SpellGrantSource | null {
  if (!classDef?.spellcasting) return null;
  const { spellcasting } = classDef;
  return {
    key: 'class',
    label: `Magias de ${classDef.name}`,
    ability: spellcasting.ability,
    spellListIds: spellcasting.spellListIds,
    cantripsCount: spellcasting.cantripsKnownByLevel[level] ?? spellcasting.cantripsKnownByLevel[1] ?? 0,
    spellsCount: preparedSpellCount(level, abilityMod),
    maxSpellLevel: 1,
  };
}

export function featSpellGrantSources(featIds: string[]): SpellGrantSource[] {
  const seen = new Set<string>();
  const sources: SpellGrantSource[] = [];
  for (const featId of featIds) {
    if (seen.has(featId)) continue;
    seen.add(featId);
    const feat = getFeat(featId);
    if (!feat?.spellGrant) continue;
    sources.push({
      key: featId,
      label: `${feat.name} (talento)`,
      ability: feat.spellGrant.ability,
      spellListIds: feat.spellGrant.spellListIds,
      cantripsCount: feat.spellGrant.cantripsCount,
      spellsCount: feat.spellGrant.spellsCount,
      maxSpellLevel: feat.spellGrant.maxSpellLevel,
    });
  }
  return sources;
}
