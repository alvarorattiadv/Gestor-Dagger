import { getItem } from './items';

const CATEGORY_LABELS: Record<string, string> = {
  'armadura-leve': 'Armaduras Leves',
  'armadura-media': 'Armaduras Médias',
  'armadura-pesada': 'Armaduras Pesadas',
  escudo: 'Escudos',
  'arma-simples': 'Armas Simples',
  'arma-marcial': 'Armas Marciais',
};

/** Proficiency lists mix broad categories (e.g. "arma-simples") and specific item ids (e.g. "adaga") — resolve either to a readable label. */
export function formatProficiencyLabel(id: string): string {
  if (CATEGORY_LABELS[id]) return CATEGORY_LABELS[id];
  const item = getItem(id);
  if (item) return item.name;
  return id;
}

export function formatProficiencyList(ids: string[]): string {
  if (ids.length === 0) return 'Nenhuma';
  return ids.map(formatProficiencyLabel).join(', ');
}
