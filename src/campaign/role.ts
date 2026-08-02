import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export type Role = 'gm' | 'player';
export type ProfileStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  role: Role;
  status: ProfileStatus;
  display_name: string;
  linked_character_id: string | null;
}

interface RoleState {
  initialized: boolean;
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  /** Only set once the profile exists AND is approved by the GM. */
  role: Role | null;
  authError: string | null;

  init: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  initialized: false,
  loading: true,
  user: null,
  profile: null,
  role: null,
  authError: null,

  init: async () => {
    if (get().initialized) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user ?? null });
    if (session?.user) await get().refreshProfile();
    set({ initialized: true, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
      if (session?.user) {
        get().refreshProfile();
      } else {
        set({ profile: null, role: null });
      }
    });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null, role: null });
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error || !data) {
      set({ profile: null, role: null });
      return;
    }
    const profile = data as Profile;
    set({ profile, role: profile.status === 'approved' ? profile.role : null });
  },

  signUp: async (email, password, displayName) => {
    set({ authError: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      set({ authError: error.message });
      return { error: error.message, needsConfirmation: false };
    }
    const needsConfirmation = !data.session;
    if (data.session) {
      set({ user: data.session.user });
      await get().refreshProfile();
    }
    return { error: null, needsConfirmation };
  },

  signIn: async (email, password) => {
    set({ authError: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ authError: error.message });
      return { error: error.message };
    }
    set({ user: data.user });
    await get().refreshProfile();
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, role: null });
  },
}));
