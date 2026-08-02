import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Campaign, City, MapData, MapMarker, TemplarMember, Thread, Session, Player, GlobalNpc, Faction, Artifact } from './types';
import { emptyCampaign, emptyCity } from './types';

function normalizeMap(map: MapData): MapData {
  return {
    ...map,
    markers: map.markers.map((m) => ({ ...m, kind: m.kind ?? 'icon' }) as MapMarker),
  };
}

function normalizeCampaign(campaign: Campaign): Campaign {
  return {
    ...campaign,
    globalNpcs: campaign.globalNpcs ?? [],
    factions: campaign.factions ?? [],
    artifacts: campaign.artifacts ?? [],
    worldMap: normalizeMap(campaign.worldMap),
    cities: campaign.cities.map((c) => ({ ...c, map: normalizeMap(c.map) })),
    templars: {
      ...campaign.templars,
      members: campaign.templars.members.map((m) => ({ ...m, gmSecret: m.gmSecret ?? '' })),
    },
  };
}

interface CampaignStoreState {
  campaign: Campaign;
  importedFileName: string | null;

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

  addThread: () => void;
  updateThread: (id: string, updater: (t: Thread) => Thread) => void;
  removeThread: (id: string) => void;

  addSession: () => void;
  updateSession: (id: string, updater: (s: Session) => Session) => void;
  removeSession: (id: string) => void;

  setHope: (v: number) => void;
  setFear: (v: number) => void;
  addPlayer: () => void;
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

      setCampaignName: (name) => set((s) => ({ campaign: { ...s.campaign, name } })),

      updateWorldMap: (updater) =>
        set((s) => ({ campaign: { ...s.campaign, worldMap: updater(s.campaign.worldMap) } })),

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
        return city;
      },

      updateCity: (id, updater) =>
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
        })),

      removeCity: (id) =>
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
          },
        })),

      getCity: (id) => get().campaign.cities.find((c) => c.id === id),

      addTemplar: (name, status = 'suspeito') =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            templars: {
              ...s.campaign.templars,
              members: [
                ...s.campaign.templars.members,
                { id: crypto.randomUUID(), name: name || 'Novo Templário', status, description: '', gmSecret: '', cityId: undefined },
              ],
            },
          },
        })),

      updateTemplar: (id, updater) =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            templars: {
              ...s.campaign.templars,
              members: s.campaign.templars.members.map((m) => (m.id === id ? updater(m) : m)),
            },
          },
        })),

      removeTemplar: (id) =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            templars: { ...s.campaign.templars, members: s.campaign.templars.members.filter((m) => m.id !== id) },
          },
        })),

      setTemplarNotes: (notes) =>
        set((s) => ({ campaign: { ...s.campaign, templars: { ...s.campaign.templars, notes } } })),

      addThread: () =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            threads: [
              ...s.campaign.threads,
              {
                id: crypto.randomUUID(),
                title: 'Novo fio narrativo',
                status: 'ativo',
                description: '',
                cityId: undefined,
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        })),

      updateThread: (id, updater) =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            threads: s.campaign.threads.map((t) => (t.id === id ? { ...updater(t), updatedAt: new Date().toISOString() } : t)),
          },
        })),

      removeThread: (id) =>
        set((s) => ({ campaign: { ...s.campaign, threads: s.campaign.threads.filter((t) => t.id !== id) } })),

      addSession: () =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            sessions: [
              {
                id: crypto.randomUUID(),
                date: new Date().toISOString().slice(0, 10),
                title: `Sessão ${s.campaign.sessions.length + 1}`,
                summary: '',
                hooks: '',
                lootXp: '',
              },
              ...s.campaign.sessions,
            ],
          },
        })),

      updateSession: (id, updater) =>
        set((s) => ({
          campaign: { ...s.campaign, sessions: s.campaign.sessions.map((sess) => (sess.id === id ? updater(sess) : sess)) },
        })),

      removeSession: (id) =>
        set((s) => ({ campaign: { ...s.campaign, sessions: s.campaign.sessions.filter((sess) => sess.id !== id) } })),

      setHope: (v) => set((s) => ({ campaign: { ...s.campaign, party: { ...s.campaign.party, hope: Math.max(0, v) } } })),
      setFear: (v) =>
        set((s) => ({ campaign: { ...s.campaign, party: { ...s.campaign.party, fear: Math.max(0, Math.min(12, v)) } } })),

      addPlayer: () =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            party: {
              ...s.campaign.party,
              players: [
                ...s.campaign.party.players,
                { id: crypto.randomUUID(), playerName: '', charName: 'Novo Personagem', ancestryClass: '', notes: '' },
              ],
            },
          },
        })),

      updatePlayer: (id, updater) =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            party: { ...s.campaign.party, players: s.campaign.party.players.map((p) => (p.id === id ? updater(p) : p)) },
          },
        })),

      removePlayer: (id) =>
        set((s) => ({
          campaign: { ...s.campaign, party: { ...s.campaign.party, players: s.campaign.party.players.filter((p) => p.id !== id) } },
        })),

      addGlobalNpc: () =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            globalNpcs: [
              ...s.campaign.globalNpcs,
              { id: crypto.randomUUID(), name: 'Novo NPC', role: '', description: '', secret: '', cityId: undefined },
            ],
          },
        })),

      updateGlobalNpc: (id, updater) =>
        set((s) => ({
          campaign: { ...s.campaign, globalNpcs: s.campaign.globalNpcs.map((n) => (n.id === id ? updater(n) : n)) },
        })),

      removeGlobalNpc: (id) =>
        set((s) => ({ campaign: { ...s.campaign, globalNpcs: s.campaign.globalNpcs.filter((n) => n.id !== id) } })),

      addFaction: () =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            factions: [
              ...s.campaign.factions,
              { id: crypto.randomUUID(), name: 'Nova facção', leader: '', description: '', notes: '', cityId: undefined },
            ],
          },
        })),

      updateFaction: (id, updater) =>
        set((s) => ({
          campaign: { ...s.campaign, factions: s.campaign.factions.map((f) => (f.id === id ? updater(f) : f)) },
        })),

      removeFaction: (id) =>
        set((s) => ({ campaign: { ...s.campaign, factions: s.campaign.factions.filter((f) => f.id !== id) } })),

      addArtifact: () =>
        set((s) => ({
          campaign: {
            ...s.campaign,
            artifacts: [
              ...s.campaign.artifacts,
              {
                id: crypto.randomUUID(),
                name: 'Novo artefato',
                description: '',
                status: 'mito',
                possibleLocation: '',
                possibleOwner: '',
              },
            ],
          },
        })),

      updateArtifact: (id, updater) =>
        set((s) => ({
          campaign: { ...s.campaign, artifacts: s.campaign.artifacts.map((a) => (a.id === id ? updater(a) : a)) },
        })),

      removeArtifact: (id) =>
        set((s) => ({ campaign: { ...s.campaign, artifacts: s.campaign.artifacts.filter((a) => a.id !== id) } })),

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
