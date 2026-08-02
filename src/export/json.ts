import type { Character } from '../types/character';

export function downloadCharacterJson(character: Character) {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'personagem'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseCharacterJson(text: string): Character {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !data.id || !data.classId || !data.speciesId) {
    throw new Error('Arquivo não parece ser uma ficha de personagem válida.');
  }
  return data as Character;
}
