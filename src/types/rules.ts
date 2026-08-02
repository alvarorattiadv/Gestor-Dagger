export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Força',
  dex: 'Destreza',
  con: 'Constituição',
  int: 'Inteligência',
  wis: 'Sabedoria',
  cha: 'Carisma',
};

export const SKILL_KEYS = [
  'acrobatics',
  'animalHandling',
  'arcana',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'sleightOfHand',
  'stealth',
  'survival',
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

export const SKILL_INFO: Record<SkillKey, { label: string; ability: AbilityKey }> = {
  acrobatics: { label: 'Acrobacia', ability: 'dex' },
  animalHandling: { label: 'Adestrar Animais', ability: 'wis' },
  arcana: { label: 'Arcanismo', ability: 'int' },
  athletics: { label: 'Atletismo', ability: 'str' },
  deception: { label: 'Enganação', ability: 'cha' },
  history: { label: 'História', ability: 'int' },
  insight: { label: 'Intuição', ability: 'wis' },
  intimidation: { label: 'Intimidação', ability: 'cha' },
  investigation: { label: 'Investigação', ability: 'int' },
  medicine: { label: 'Medicina', ability: 'wis' },
  nature: { label: 'Natureza', ability: 'int' },
  perception: { label: 'Percepção', ability: 'wis' },
  performance: { label: 'Atuação', ability: 'cha' },
  persuasion: { label: 'Persuasão', ability: 'cha' },
  religion: { label: 'Religião', ability: 'int' },
  sleightOfHand: { label: 'Prestidigitação', ability: 'dex' },
  stealth: { label: 'Furtividade', ability: 'dex' },
  survival: { label: 'Sobrevivência', ability: 'wis' },
};

export type CasterProgression = 'full' | 'half' | 'third' | 'none';

export type Size = 'Pequeno' | 'Médio' | 'Grande';

export const DAMAGE_TYPES = [
  'Ácido',
  'Concussão',
  'Corte',
  'Fogo',
  'Força',
  'Frio',
  'Necrótico',
  'Perfuração',
  'Psíquico',
  'Radiante',
  'Raio',
  'Trovão',
  'Veneno',
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];
