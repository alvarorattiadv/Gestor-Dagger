import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useCampaignStore } from './store';
import { useRoleStore } from './role';
import { downloadCampaignJson } from './io';
import { SmallButton } from './components/SmallButton';
import { RoleGate } from './components/RoleGate';
import { DiceRoller } from './components/DiceRoller';

const AUTO_SYNC_INTERVAL_MS = 10 * 60 * 1000;

function formatSyncTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const TABS = [
  { to: '/campanha', label: 'Mapa Mundi', end: true },
  { to: '/campanha/cidades', label: 'Cidades' },
  { to: '/campanha/npcs-faccoes', label: 'NPCs & Facções' },
  { to: '/campanha/templarios', label: 'Templários' },
  { to: '/campanha/artefatos', label: 'Artefatos' },
  { to: '/campanha/sessoes', label: 'Sessões' },
  { to: '/campanha/fios', label: 'Fios Narrativos' },
  { to: '/campanha/grupo', label: 'Grupo' },
];

export function CampaignLayout() {
  const campaign = useCampaignStore((s) => s.campaign);
  const loading = useCampaignStore((s) => s.loading);
  const lastSyncedAt = useCampaignStore((s) => s.lastSyncedAt);
  const loadFromSupabase = useCampaignStore((s) => s.loadFromSupabase);
  const setCampaignName = useCampaignStore((s) => s.setCampaignName);
  const role = useRoleStore((s) => s.role);
  const profile = useRoleStore((s) => s.profile);
  const signOut = useRoleStore((s) => s.signOut);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    loadFromSupabase();
    const interval = setInterval(loadFromSupabase, AUTO_SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadFromSupabase]);

  if (loading && !lastSyncedAt) {
    return (
      <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center">
        <p className="text-sm text-stone-500">Carregando campanha...</p>
      </div>
    );
  }

  return (
    <RoleGate>
    <div className="min-h-screen bg-[#f4efe6]">
      <header className="border-b border-stone-300 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    role === 'gm' ? 'bg-violet-100 text-violet-800' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {role === 'gm' ? 'Mestre' : 'Jogador'}
                  {profile?.display_name ? ` · ${profile.display_name}` : ''}
                </span>
                {editingName ? (
                  <input
                    autoFocus
                    defaultValue={campaign.name}
                    onBlur={(e) => {
                      setCampaignName(e.target.value || campaign.name);
                      setEditingName(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    className="text-xl font-bold text-stone-900 border-b border-violet-400 outline-none min-w-0"
                  />
                ) : (
                  <h1
                    className="text-xl font-bold text-stone-900 truncate cursor-text"
                    title="Clique para renomear"
                    onClick={() => setEditingName(true)}
                  >
                    {campaign.name}
                  </h1>
                )}
              </div>
              {lastSyncedAt && (
                <p className="text-xs italic text-stone-400 mt-0.5 truncate">Sincronizado às {formatSyncTime(lastSyncedAt)}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <SmallButton variant="secondary" onClick={() => loadFromSupabase()} disabled={loading}>
                {loading ? 'Sincronizando...' : 'Sincronizar'}
              </SmallButton>
              <SmallButton variant="secondary" onClick={() => downloadCampaignJson(campaign)}>
                Exportar backup
              </SmallButton>
              <SmallButton variant="secondary" onClick={() => signOut()}>
                Sair
              </SmallButton>
            </div>
          </div>
          <nav className="flex gap-1 mt-4 flex-wrap">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-violet-700 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <DiceRoller />
    </div>
    </RoleGate>
  );
}
