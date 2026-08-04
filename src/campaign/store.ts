import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Campaign, City, MapData, MapMarker, TemplarMember, Thread, Session, Player, GlobalNpc, Faction, Artifact } from './types';
import { emptyCampaign, emptyCity } from './types';
import {
  fetchCampaign,
  dbInsertCity,
  dbUpsertCity,
  dbDeleteCity,
  dbReplaceCityNpcs,
  dbReplaceCityRumors,
  dbUpsertGlobalNpc,
  dbDeleteNpc,
  dbUpsertFaction,
  dbDeleteFaction,
  dbUpsertTemplar,
  dbDeleteTemplar,
  dbUpdateTemplarOrder,
  dbUpsertArtifact,
  dbDeleteArtifact,
  dbUpsertPlayer,
  dbDeletePlayer,
  dbUpsertThread,
  dbDeleteThread,
  dbUpsertSession,
  dbDeleteSession,
  dbUpdateWorldMap,
  dbUpdatePartyResources,
  dbUpdateCampaignName,
} from './supabaseData';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Tempo esgotado ao contatar o Supabase.')), ms)),
  ]);
}

function normalizeMap(map: MapData): MapData {
  return {
    ...map,
    markers: map.markers.map((m) => ({ ...m, kind: m.kind ?? 'icon' }) as MapMarker),
  };
}

function normalizeCampaign(campaign: Campaign): Campaign {
  return {
    ...campaign,
    globalNpcs: (campaign.globalNpcs ?? []).map((n) => ({ ...n, playerNotes: n.playerNotes ?? '' })),
    factions: (campaign.factions ?? []).map((f) => ({ ...f, playerNotes: f.playerNotes ?? '' })),
    artifacts: (campaign.artifacts ?? []).map((a) => ({ ...a, gmSecret: a.gmSecret ?? '', playerNotes: a.playerNotes ?? '' })),
    worldMap: normalizeMap(campaign.worldMap),
    cities: campaign.cities.map((c) => ({
      ...c,
      gmSecret: c.gmSecret ?? '',
      playerNotes: c.playerNotes ?? '',
      map: normalizeMap(c.map),
      npcs: c.npcs.map((n) => ({ ...n, playerNotes: n.playerNotes ?? '' })),
      rumors: c.rumors.map((r) => ({ ...r, playerNotes: r.playerNotes ?? '' })),
    })),
    templars: {
      ...campaign.templars,
      playerNotes: campaign.templars.playerNotes ?? '',
      members: campaign.templars.members.map((m) => ({ ...m, gmSecret: m.gmSecret ?? '', playerNotes: m.playerNotes ?? '' })),
    },
    party: {
      ...campaign.party,
      players: campaign.party.players.map((p) => ({ ...p, gmSecret: p.gmSecret ?? '', playerNotes: p.playerNotes ?? '', level: p.level ?? 1, proficiency: p.proficiency ?? 1 })),
    },
  };
}

interface CampaignStoreState {
  campaign: Campaign;
  importedFileName: string | null;
  loading: boolean;
  lastSyncedAt: string | null;

  loadFromSupabase: () => Promise<void>;

  setCampaignName: (name: string) => void;
  updateWorldMap: (updater: (map: MapData) => MapData) => void;

  addCity: (name: string) => City;
  updateCity: (id: string, updater: (city: City) => City) => void;
  removeCity: (id: string) => void;
  getCity: (id: string) => City | undefined;

  addTemplar: (name: string, status?: TemplarMember['status']) => void;
  updateTemplar: (id: string, updater: (m: TemplarMember) => TemplarMember) => void;
  removeTemplar: (id: string) => void;
  setTemplarNotes: (notes: string) => void;
  setTemplarPlayerNotes: (playerNotes: string) => void;

  addThread: () => void;
  updateThread: (id: string, updater: (t: Thread) => Thread) => void;
  removeThread: (id: string) => void;

  addSession: () => void;
  updateSession: (id: string, updater: (s: Session) => Session) => void;
  removeSession: (id: string) => void;

  setHope: (v: number) => void;
  setFear: (v: number) => void;
  addPlayer: (linkedUserId?: string) => void;
  updatePlayer: (id: string, updater: (p: Player) => Player) => void;
  removePlayer: (id: string) => void;

  addGlobalNpc: () => void;
  updateGlobalNpc: (id: string, updater: (n: GlobalNpc) => GlobalNpc) => void;
  removeGlobalNpc: (id: string) => void;

  addFaction: () => void;
  updateFaction: (id: string, updater: (f: Faction) => Faction) => void;
  removeFaction: (id: string) => void;

  addArtifact: () => void;
  updateArtifact: (id: string, updater: (a: Artifact) => Artifact) => void;
  removeArtifact: (id: string) => void;

  importCampaign: (data: Campaign, fileName?: string) => void;
  resetCampaign: () => void;
}

export const useCampaignStore = create<CampaignStoreState>()(
  persist(
    (set, get) => ({
      campaign: emptyCampaign(),
      importedFileName: null,
      loading: false,
      lastSyncedAt: null,

      loadFromSupabase: async () => {
        set({ loading: true });
        try {
          const campaign = await withTimeout(fetchCampaign(), 15000);
          set({ campaign: normalizeCampaign(campaign), loading: false, lastSyncedAt: new Date().toISOString() });
        } catch (err) {
          console.warn('[supabase] falha ao carregar campanha:', err);
          set({ loading: false });
        }
      },

      setCampaignName: (name) => {
        set((s) => ({ campaign: { ...s.campaign, name } }));
        dbUpdateCampaignName(name);
      },

      updateWorldMap: (updater) => {
        set((s) => ({ campaign: { ...s.campaign, worldMap: updater(s.campaign.worldMap) } }));
        dbUpdateWorldMap(get().campaign.worldMap);
      },

      addCity: (name) => {
        const city = emptyCity(name || 'Nova Cidade');
        set((s) => ({
          campaign: {
            ...s.campaign,
            cities: [...s.campaign.cities, city],
            worldMap: {
              ...s.campaign.worldMap,
              markers: [
                ...s.campaign.worldMap.markers,
                {
                  id: crypto.randomUUID(),
                  x: 50,
                  y: 50,
                  kind: 'icon',
                  icon: 'city',
                  color: '#b8860b',
                  label: city.name,
                  note: '',
                  linkCityId: city.id,
                },
              ],
            },
          },
        }));
        dbInsertCity(city);
        dbUpdateWorldMap(get().campaign.worldMap);
        return city;
      },

      updateCity: (id, updater) => {
        const before = get().campaign.cities.find((c) => c.id === id);
        set((s) => ({
          campaign: {
            ...s.campaign,
            cities: s.campaign.cities.map((c) => (c.id === id ? { ...updater(c), updatedAt: new Date().toISOString() } : c)),
            worldMap: {
              ...s.campaign.worldMap,
              markers: s.campaign.worldMap.markers.map((m) => {
                if (m.linkCityId !== id) return m;
                const city = s.campaign.cities.find((c) => c.id === id);
                if (!city) return m;
                const updated = updater(city);
                return updated.name !== m.label ? { ...m, label: updated.name } : m;
              }),
            },
          },
        }));
        const after = get().campaign.cities.find((c) => c.id === id);
        if (!after) return;
        const nameChanged = !before || before.name !== after.name;
        if (
          nameChanged ||
          !before ||
          before.summary !== after.summary ||
          before.gmSecret !== after.gmSecret ||
          before.playerNotes !== after.playerNotes ||
          before.map !== after.map ||
          before.morale !== after.morale
        ) {
          dbUpsertCity(after);
        }
        if (!before || before.npcs !== after.npcs) dbReplaceCityNpcs(id, after.npcs);
        if (!before || before.rumors !== after.rumors) dbReplaceCityRumors(id, after.rumors);
        if (nameChanged) dbUpdateWorldMap(get().campaign.worldMap);
      },

      removeCity: (id) => {
        set((s) => ({
          campaign: {
            ...s.campaign,
            cities: s.campaign.cities.filter((c) => c.id !== id),
            worldMap: { ...s.campaign.worldMap, markers: s.campaign.worldMap.markers.filter((m) => m.linkCityId !== id) },
            threads: s.campaign.threads.map((t) => (t.cityId === id ? { ...t, cityId: undefined } : t)),
            templars: {
              ...s.campaign.templars,
              members: s.campaign.templars.members.map((m) => (m.cityId === id ? { ...m, cityId: undefined } : m)),
            },
            factions: s.campaign.factions.map((f) => (f.cityId === id ? { ...f, cityId: undefined } : f)),
            globalNpcs: s.campaign.globalNpcs.map((n) => (n.cityId === id ? { ...n, cityId: undefined } : n)),
          },
        }));
        dbDeleteCity(id);
        dbUpdateWorldMap(get().campaign.worldMap);
      },

      getCity: (id) => get().campaign.cities.find((c) => c.id === id),

      addTemplar: (name, status = 'suspeito') => {
        const member: TemplarMember = {
          id: crypto.randomUUID(),
          name: name || 'Novo Templário',
          status,
          description: '',
          gmSecret: '',
          playerNotes: '',
          cityId: undefined,
        };
        set((s) => ({
          campaign: { ...s.campaign, templars: { ...s.campaign.templars, members: [...s.campaign.templars.members, member] } },
        }));
        dbUpsertTemplar(member);
      },

      updateTemplar: (id, updater) => {
        set((s) => ({
          campaign: {
            ...s.campaign,
            templars: {
              ...s.campaign.templars,
              members: s.campaign.templars.members.map((m) => (m.id === id ? updater(m) : m)),
            },
          },
        }));
        const updated = get().campaign.templars.members.find((m) => m.id === id);
        if (updated) dbUpsertTemplar(updated);
      },

      removeTemplar: (id) => {
        set((s) => ({
          campaign: {
            ...s.campaign,
            templars: { ...s.campaign.templars, members: s.campaign.templars.members.filter((m) => m.id !== id) },
          },
        }));
        dbDeleteTemplar(id);
      },

      setTemplarNotes: (notes) => {
        set((s) => ({ campaign: { ...s.campaign, templars: { ...s.campaign.templars, notes } } }));
        dbUpdateTemplarOrder(notes, get().campaign.templars.playerNotes);
      },

      setTemplarPlayerNotes: (playerNotes) => {
        set((s) => ({ campaign: { ...s.campaign, templars: { ...s.campaign.templars, playerNotes } } }));
        dbUpdateTemplarOrder(get().campaign.templars.notes, playerNotes);
      },

      addThread: () => {
        const thread: Thread = {
          id: crypto.randomUUID(),
          title: 'Novo fio narrativo',
          status: 'ativo',
          description: '',
          cityId: undefined,
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ campaign: { ...s.campaign, threads: [...s.campaign.threads, thread] } }));
        dbUpsertThread(thread);
      },

      updateThread: (id, updater) => {
        set((s) => ({
          campaign: {
            ...s.campaign,
            threads: s.campaign.threads.map((t) => (t.id === id ? { ...updater(t), updatedAt: new Date().toISOString() } : t)),
          },
        }));
        const updated = get().campaign.threads.find((t) => t.id === id);
        if (updated) dbUpsertThread(updated);
      },

      removeThread: (id) => {
        set((s) => ({ campaign: { ...s.campaign, threads: s.campaign.threads.filter((t) => t.id !== id) } }));
        dbDeleteThread(id);
      },

      addSession: () => {
        const session: Session = {
          id: crypto.randomUUID(),
          date: new Date().toISOString().slice(0, 10),
          title: `Sessão ${get().campaign.sessions.length + 1}`,
          summary: '',
          hooks: '',
          lootXp: '',
        };
        set((s) => ({ campaign: { ...s.campaign, sessions: [session, ...s.campaign.sessions] } }));
        dbUpsertSession(session);
      },

      updateSession: (id, updater) => {
        set((s) => ({
          campaign: { ...s.campaign, sessions: s.campaign.sessions.map((sess) => (sess.id === id ? updater(sess) : sess)) },
        }));
        const updated = get().campaign.sessions.find((sess) => sess.id === id);
        if (updated) dbUpsertSession(updated);
      },

      removeSession: (id) => {
        set((s) => ({ campaign: { ...s.campaign, sessions: s.campaign.sessions.filter((sess) => sess.id !== id) } }));
        dbDeleteSession(id);
      },

      setHope: (v) => {
        set((s) => ({ campaign: { ...s.campaign, party: { ...s.campaign.party, hope: Math.max(0, v) } } }));
        const party = get().campaign.party;
        dbUpdatePartyResources(party.hope, party.fear);
      },
      setFear: (v) => {
        set((s) => ({ campaign: { ...s.campaign, party: { ...s.campaign.party, fear: Math.max(0, Math.min(12, v)) } } }));
        const party = get().campaign.party;
        dbUpdatePartyResources(party.hope, party.fear);
      },

      addPlayer: (linkedUserId) => {
        const player: Player = {
          id: crypto.randomUUID(),
          playerName: '',
          charName: 'Novo Personagem',
          ancestryClass: '',
          notes: '',
          gmSecret: '',
          playerNotes: '',
          linkedUserId,
          level: 1,
          proficiency: 1,
        };
        set((s) => ({ campaign: { ...s.campaign, party: { ...s.campaign.party, players: [...s.campaign.party.players, player] } } }));
        dbUpsertPlayer(player);
      },

      updatePlayer: (id, updater) => {
        set((s) => ({
          campaign: {
            ...s.campaign,
            party: { ...s.campaign.party, players: s.campaign.party.players.map((p) => (p.id === id ? updater(p) : p)) },
          },
        }));
        const updated = get().campaign.party.players.find((p) => p.id === id);
        if (updated) dbUpsertPlayer(updated);
      },

      removePlayer: (id) => {
        set((s) => ({
          campaign: { ...s.campaign, party: { ...s.campaign.party, players: s.campaign.party.players.filter((p) => p.id !== id) } },
        }));
        dbDeletePlayer(id);
      },

      addGlobalNpc: () => {
        const npc: GlobalNpc = { id: crypto.randomUUID(), name: 'Novo NPC', role: '', description: '', secret: '', playerNotes: '', cityId: undefined };
        set((s) => ({ campaign: { ...s.campaign, globalNpcs: [...s.campaign.globalNpcs, npc] } }));
        dbUpsertGlobalNpc(npc);
      },

      updateGlobalNpc: (id, updater) => {
        set((s) => ({
          campaign: { ...s.campaign, globalNpcs: s.campaign.globalNpcs.map((n) => (n.id === id ? updater(n) : n)) },
        }));
        const updated = get().campaign.globalNpcs.find((n) => n.id === id);
        if (updated) dbUpsertGlobalNpc(updated);
      },

      removeGlobalNpc: (id) => {
        set((s) => ({ campaign: { ...s.campaign, globalNpcs: s.campaign.globalNpcs.filter((n) => n.id !== id) } }));
        dbDeleteNpc(id);
      },

      addFaction: () => {
        const faction: Faction = { id: crypto.randomUUID(), name: 'Nova facção', leader: '', description: '', notes: '', playerNotes: '', cityId: undefined };
        set((s) => ({ campaign: { ...s.campaign, factions: [...s.campaign.factions, faction] } }));
        dbUpsertFaction(faction);
      },

      updateFaction: (id, updater) => {
        set((s) => ({
          campaign: { ...s.campaign, factions: s.campaign.factions.map((f) => (f.id === id ? updater(f) : f)) },
        }));
        const updated = get().campaign.factions.find((f) => f.id === id);
        if (updated) dbUpsertFaction(updated);
      },

      removeFaction: (id) => {
        set((s) => ({ campaign: { ...s.campaign, factions: s.campaign.factions.filter((f) => f.id !== id) } }));
        dbDeleteFaction(id);
      },

      addArtifact: () => {
        const artifact: Artifact = {
          id: crypto.randomUUID(),
          name: 'Novo artefato',
          description: '',
          status: 'mito',
          possibleLocation: '',
          possibleOwner: '',
          gmSecret: '',
          playerNotes: '',
        };
        set((s) => ({ campaign: { ...s.campaign, artifacts: [...s.campaign.artifacts, artifact] } }));
        dbUpsertArtifact(artifact);
      },

      updateArtifact: (id, updater) => {
        set((s) => ({
          campaign: { ...s.campaign, artifacts: s.campaign.artifacts.map((a) => (a.id === id ? updater(a) : a)) },
        }));
        const updated = get().campaign.artifacts.find((a) => a.id === id);
        if (updated) dbUpsertArtifact(updated);
      },

      removeArtifact: (id) => {
        set((s) => ({ campaign: { ...s.campaign, artifacts: s.campaign.artifacts.filter((a) => a.id !== id) } }));
        dbDeleteArtifact(id);
      },

      importCampaign: (data, fileName) => set({ campaign: normalizeCampaign(data), importedFileName: fileName ?? null }),
      resetCampaign: () => set({ campaign: emptyCampaign(), importedFileName: null }),
    }),
    {
      name: 'daggerheart-campaign',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { campaign?: Campaign } | undefined;
        return {
          ...currentState,
          ...persisted,
          campaign: persisted?.campaign ? normalizeCampaign(persisted.campaign) : currentState.campaign,
        };
      },
    },
  ),
);
