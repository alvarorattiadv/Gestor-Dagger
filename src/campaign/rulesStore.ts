import { create } from 'zustand';
import type { CharacterAdvancement, DaggerheartRules } from './rulesTypes';
import {
  addCharacterAdvancement,
  claimDomainCard,
  fetchCharacterAdvancements,
  fetchClaimedDomainCards,
  fetchDaggerheartRules,
  releaseDomainCard,
  removeCharacterAdvancement,
  setDomainCardLoadout,
  type ClaimedCardInfo,
} from './rulesData';

export const MAX_LOADOUT_CARDS = 5;

interface RulesState {
  rules: DaggerheartRules | null;
  /** domainCardId -> { characterId, inLoadout }, campaign-wide */
  claimedCards: Record<string, ClaimedCardInfo>;
  /** characterId -> their logged advancements, loaded lazily per character sheet */
  advancementsByCharacter: Record<string, CharacterAdvancement[]>;
  loading: boolean;
  loaded: boolean;
  error: string | null;

  loadRules: () => Promise<void>;
  claimCard: (characterId: string, domainCardId: string, inLoadout: boolean) => Promise<{ ok: boolean; error: string | null }>;
  releaseCard: (characterId: string, domainCardId: string) => Promise<void>;
  setCardLoadout: (characterId: string, domainCardId: string, inLoadout: boolean) => Promise<void>;
  loadAdvancements: (characterId: string) => Promise<void>;
  addAdvancement: (characterId: string, level: number, optionId: string, detail: string) => Promise<void>;
  removeAdvancement: (characterId: string, advancementId: string) => Promise<void>;
}

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: null,
  claimedCards: {},
  advancementsByCharacter: {},
  loading: false,
  loaded: false,
  error: null,

  loadRules: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: null });
    try {
      const [rules, claimedCards] = await Promise.all([fetchDaggerheartRules(), fetchClaimedDomainCards()]);
      set({ rules, claimedCards, loading: false, loaded: true });
    } catch (err) {
      console.warn('[rules] falha ao carregar regras de Daggerheart:', err);
      set({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  },

  claimCard: async (characterId, domainCardId, inLoadout) => {
    const result = await claimDomainCard(characterId, domainCardId, inLoadout);
    if (result.ok) {
      set((s) => ({ claimedCards: { ...s.claimedCards, [domainCardId]: { characterId, inLoadout } } }));
    }
    return result;
  },

  releaseCard: async (characterId, domainCardId) => {
    await releaseDomainCard(characterId, domainCardId);
    set((s) => {
      const next = { ...s.claimedCards };
      delete next[domainCardId];
      return { claimedCards: next };
    });
  },

  setCardLoadout: async (characterId, domainCardId, inLoadout) => {
    await setDomainCardLoadout(characterId, domainCardId, inLoadout);
    set((s) => ({ claimedCards: { ...s.claimedCards, [domainCardId]: { characterId, inLoadout } } }));
  },

  loadAdvancements: async (characterId) => {
    try {
      const advancements = await fetchCharacterAdvancements(characterId);
      set((s) => ({ advancementsByCharacter: { ...s.advancementsByCharacter, [characterId]: advancements } }));
    } catch (err) {
      console.warn('[rules] falha ao carregar avanços do personagem:', err);
    }
  },

  addAdvancement: async (characterId, level, optionId, detail) => {
    const created = await addCharacterAdvancement(characterId, level, optionId, detail);
    set((s) => ({ advancementsByCharacter: { ...s.advancementsByCharacter, [characterId]: [...(s.advancementsByCharacter[characterId] ?? []), created] } }));
  },

  removeAdvancement: async (characterId, advancementId) => {
    await removeCharacterAdvancement(advancementId);
    set((s) => ({
      advancementsByCharacter: { ...s.advancementsByCharacter, [characterId]: (s.advancementsByCharacter[characterId] ?? []).filter((a) => a.id !== advancementId) },
    }));
  },
}));
