import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useCampaignStore } from './store';
import { useRoleStore } from './role';
import { downloadCampaignJson, parseCampaignJson } from './io';
import { SmallButton } from './components/SmallButton';
import { RoleGate } from './components/RoleGate';

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
  const importedFileName = useCampaignStore((s) => s.importedFileName);
  const setCampaignName = useCampaignStore((s) => s.setCampaignName);
  const importCampaign = useCampaignStore((s) => s.importCampaign);
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const [editingName, setEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const data = parseCampaignJson(text);
      if (confirm('Importar substituirá todos os dados atuais da campanha. Continuar?')) {
        importCampaign(data, file.name);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao importar o arquivo.');
    }
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
              {importedFileName && (
                <p className="text-xs italic text-stone-400 mt-0.5 truncate">Arquivo: {importedFileName}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
              <SmallButton variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Importar
              </SmallButton>
              <SmallButton variant="secondary" onClick={() => downloadCampaignJson(campaign)}>
                Exportar backup
              </SmallButton>
              <SmallButton variant="secondary" onClick={() => setRole(null)}>
                Trocar papel
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
    </div>
    </RoleGate>
  );
}
