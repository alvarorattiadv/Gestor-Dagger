import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'gm' | 'player';

export const GM_PASSWORD = 'SEUNOMECOMPLETO';

interface RoleState {
  role: Role | null;
  setRole: (role: Role | null) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
    }),
    { name: 'daggerheart-role' },
  ),
);
