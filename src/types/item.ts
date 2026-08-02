import type { DamageType } from './rules';

export type ItemCategory = 'arma-simples' | 'arma-marcial' | 'armadura-leve' | 'armadura-media' | 'armadura-pesada' | 'escudo' | 'ferramenta' | 'aventura' | 'pacote';

export interface WeaponProps {
  damageDice: string;
  damageType: DamageType;
  properties: string[];
  range?: string;
}

export interface ArmorProps {
  baseAC: number;
  addDexMod: boolean;
  maxDexBonus?: number;
  strRequirement?: number;
  stealthDisadvantage?: boolean;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  weight: number;
  costGold: number;
  description?: string;
  weapon?: WeaponProps;
  armor?: ArmorProps;
  contains?: { itemId: string; quantity: number }[];
}
