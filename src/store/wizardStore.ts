import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEmptyDraft, type WizardDraft } from '../wizard/types';

interface WizardStoreState {
  draft: WizardDraft;
  setDraft: (patch: Partial<WizardDraft>) => void;
  resetDraft: () => void;
}

export const useWizardStore = create<WizardStoreState>()(
  persist(
    (set) => ({
      draft: createEmptyDraft(),
      setDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
      resetDraft: () => set({ draft: createEmptyDraft() }),
    }),
    { name: 'dnd2024-wizard-draft' },
  ),
);
