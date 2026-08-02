import type { Size } from './rules';

export interface SpeciesTrait {
  name: string;
  description: string;
}

export interface SpeciesLineage {
  id: string;
  name: string;
  description: string;
  grantedTraits: SpeciesTrait[];
}

export interface Species {
  id: string;
  name: string;
  description: string;
  size: Size;
  speed: number;
  traits: SpeciesTrait[];
  lineages?: SpeciesLineage[];
  /** Flat HP bonus per character level (e.g. Anão's Dwarven Toughness: 1). */
  hpBonusPerLevel?: number;
}
