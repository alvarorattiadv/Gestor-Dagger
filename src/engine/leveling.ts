import type { ClassDef } from '../types/classDef';

export function isAbilityScoreImprovementLevel(classDef: ClassDef, level: number): boolean {
  return classDef.abilityScoreImprovementLevels.includes(level);
}

export function isSubclassLevel(classDef: ClassDef, level: number): boolean {
  return classDef.subclassLevel === level;
}

export function featuresGrantedAtLevel(classDef: ClassDef, level: number) {
  return classDef.features.filter((f) => f.level === level);
}
