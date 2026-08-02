import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character } from '../types/character';

/** Fills in fields added after a character may have been saved, so old localStorage/JSON data keeps working. */
function normalizeCharacter(character: Character): Character {
  return {
    ...character,
    featSpellSelections: character.featSpellSelections ?? {},
    featResourcesUsed: character.featResourcesUsed ?? {},
  };
}

interface CharacterStoreState {
  characters: Character[];
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updater: (character: Character) => Character) => void;
  removeCharacter: (id: string) => void;
  duplicateCharacter: (id: string) => void;
  importCharacter: (character: Character) => void;
  getCharacter: (id: string) => Character | undefined;
}

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    (set, get) => ({
      characters: [],
      addCharacter: (character) => set((state) => ({ characters: [...state.characters, character] })),
      updateCharacter: (id, updater) =>
        set((state) => ({
          characters: state.characters.map((c) => (c.id === id ? updater(c) : c)),
        })),
      removeCharacter: (id) => set((state) => ({ characters: state.characters.filter((c) => c.id !== id) })),
      duplicateCharacter: (id) =>
        set((state) => {
          const original = state.characters.find((c) => c.id === id);
          if (!original) return state;
          const copy: Character = {
            ...original,
            id: crypto.randomUUID(),
            name: `${original.name} (cópia)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { characters: [...state.characters, copy] };
        }),
      importCharacter: (character) =>
        set((state) => {
          const normalized = normalizeCharacter(character);
          const exists = state.characters.some((c) => c.id === normalized.id);
          if (exists) {
            return {
              characters: state.characters.map((c) => (c.id === normalized.id ? normalized : c)),
            };
          }
          return { characters: [...state.characters, normalized] };
        }),
      getCharacter: (id) => get().characters.find((c) => c.id === id),
    }),
    {
      name: 'dnd2024-characters',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CharacterStoreState> | undefined;
        return {
          ...currentState,
          ...persisted,
          characters: (persisted?.characters ?? []).map(normalizeCharacter),
        };
      },
    },
  ),
);
