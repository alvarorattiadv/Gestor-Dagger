import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { MapEditor } from '../components/MapEditor';
import { SmallButton } from '../components/SmallButton';
import { PlayerNotesField, GENERAL_FIELD_DISABLED_CLASS } from '../components/PlayerNotesField';
import type { Npc, Rumor, RumorStatus } from '../types';

const TABS = [
  { key: 'mapa', label: 'Mapa' },
  { key: 'npcs', label: 'NPCs' },
  { key: 'rumores', label: 'Rumores' },
  { key: 'moral', label: 'Moral dos Jogadores' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function CityDetail() {
  const { cityId } = useParams<{ cityId: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const city = useCampaignStore((s) => s.campaign.cities.find((c) => c.id === cityId));
  const updateCity = useCampaignStore((s) => s.updateCity);
  const removeCity = useCampaignStore((s) => s.removeCity);
  const isGM = useRoleStore((s) => s.role === 'gm');

  if (!city || !cityId) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p className="mb-3">Cidade não encontrada.</p>
        <Link to="/campanha/cidades" className="text-violet-700 hover:underline text-sm">
          Voltar para Cidades
        </Link>
      </div>
    );
  }

  const activeTab = (params.get('tab') as TabKey) || 'mapa';

  function setTab(tab: TabKey) {
    setParams({ tab });
  }

  function handleDelete() {
    if (confirm(`Excluir "${city!.name}"? Esta ação não pode ser desfeita.`)) {
      removeCity(cityId!);
      navigate('/campanha/cidades');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link to="/campanha/cidades" className="text-xs text-stone-500 hover:underline">
            ← Cidades
          </Link>
          <h2 className="text-xl font-bold text-stone-900">{city.name}</h2>
        </div>
        {isGM && (
          <button onClick={handleDelete} className="text-xs text-red-600 hover:underline">
            Excluir cidade
          </button>
        )}
      </div>

      <textarea
        value={city.summary}
        onChange={(e) => updateCity(cityId, (c) => ({ ...c, summary: e.target.value }))}
        disabled={!isGM}
        placeholder="Resumo da cidade (governo, clima, o que a torna única...)"
        className={`w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white ${GENERAL_FIELD_DISABLED_CLASS}`}
        rows={2}
      />

      {isGM && (
        <textarea
          value={city.gmSecret}
          onChange={(e) => updateCity(cityId, (c) => ({ ...c, gmSecret: e.target.value }))}
          placeholder="Segredo do mestre sobre a cidade"
          className="w-full border border-amber-300 bg-amber-50 rounded-lg px-3 py-2 text-sm"
          rows={2}
        />
      )}

      <PlayerNotesField value={city.playerNotes} onChange={(v) => updateCity(cityId, (c) => ({ ...c, playerNotes: v }))} />

      <div className="flex gap-1 border-b border-stone-300">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key ? 'border-violet-700 text-violet-700' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'mapa' && (
        <MapEditor map={city.map} onChange={(map) => updateCity(cityId, (c) => ({ ...c, map }))} />
      )}
      {activeTab === 'npcs' && <NpcsTab npcs={city.npcs} onChange={(npcs) => updateCity(cityId, (c) => ({ ...c, npcs }))} isGM={isGM} />}
      {activeTab === 'rumores' && (
        <RumoresTab rumors={city.rumors} onChange={(rumors) => updateCity(cityId, (c) => ({ ...c, rumors }))} isGM={isGM} />
      )}
      {activeTab === 'moral' && (
        <MoralTab
          morale={city.morale}
          onChange={(morale) => updateCity(cityId, (c) => ({ ...c, morale }))}
        />
      )}
    </div>
  );
}

function NpcsTab({ npcs, onChange, isGM }: { npcs: Npc[]; onChange: (npcs: Npc[]) => void; isGM: boolean }) {
  function add() {
    onChange([...npcs, { id: crypto.randomUUID(), name: 'Novo NPC', role: '', description: '', secret: '', playerNotes: '' }]);
  }
  function update(id: string, patch: Partial<Npc>) {
    onChange(npcs.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }
  function remove(id: string) {
    onChange(npcs.filter((n) => n.id !== id));
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <SmallButton onClick={add}>
          + NPC
        </SmallButton>
      </div>
      {npcs.length === 0 && <EmptyHint text="Nenhum NPC cadastrado nesta cidade ainda." />}
      {npcs.map((npc) => (
        <div key={npc.id} className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={npc.name}
              onChange={(e) => update(npc.id, { name: e.target.value })}
              disabled={!isGM}
              placeholder="Nome"
              className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold ${GENERAL_FIELD_DISABLED_CLASS}`}
            />
            <input
              value={npc.role}
              onChange={(e) => update(npc.id, { role: e.target.value })}
              disabled={!isGM}
              placeholder="Papel/ocupação"
              className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
            />
            {isGM && (
              <button onClick={() => remove(npc.id)} className="text-xs text-red-600 hover:underline shrink-0 px-1">
                Excluir
              </button>
            )}
          </div>
          <textarea
            value={npc.description}
            onChange={(e) => update(npc.id, { description: e.target.value })}
            disabled={!isGM}
            placeholder="Descrição, personalidade, ganchos..."
            className={`w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
            rows={2}
          />
          {isGM && (
            <textarea
              value={npc.secret}
              onChange={(e) => update(npc.id, { secret: e.target.value })}
              placeholder="Segredo do mestre (o que os jogadores ainda não sabem)"
              className="w-full border border-amber-300 bg-amber-50 rounded-md px-2 py-1.5 text-sm"
              rows={2}
            />
          )}
          <PlayerNotesField value={npc.playerNotes} onChange={(v) => update(npc.id, { playerNotes: v })} />
        </div>
      ))}
    </div>
  );
}

const RUMOR_STATUS_LABEL: Record<RumorStatus, string> = {
  'nao-verificado': 'Não verificado',
  confirmado: 'Confirmado',
  desmentido: 'Desmentido',
};
const RUMOR_STATUS_CLASS: Record<RumorStatus, string> = {
  'nao-verificado': 'bg-stone-200 text-stone-700',
  confirmado: 'bg-emerald-200 text-emerald-900',
  desmentido: 'bg-red-200 text-red-900',
};

function RumoresTab({ rumors, onChange, isGM }: { rumors: Rumor[]; onChange: (rumors: Rumor[]) => void; isGM: boolean }) {
  function add() {
    onChange([...rumors, { id: crypto.randomUUID(), text: '', status: 'nao-verificado', source: '', notes: '', playerNotes: '' }]);
  }
  function update(id: string, patch: Partial<Rumor>) {
    onChange(rumors.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function remove(id: string) {
    onChange(rumors.filter((r) => r.id !== id));
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <SmallButton onClick={add}>
          + Rumor
        </SmallButton>
      </div>
      {rumors.length === 0 && <EmptyHint text="Nenhum rumor registrado nesta cidade ainda." />}
      {rumors.map((rumor) => (
        <div key={rumor.id} className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
          <textarea
            value={rumor.text}
            onChange={(e) => update(rumor.id, { text: e.target.value })}
            disabled={!isGM}
            placeholder="O que se ouve pelas ruas..."
            className={`w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
            rows={2}
          />
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={rumor.status}
              onChange={(e) => update(rumor.id, { status: e.target.value as RumorStatus })}
              disabled={!isGM}
              className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 ${RUMOR_STATUS_CLASS[rumor.status]} disabled:opacity-70 disabled:cursor-default`}
            >
              {(Object.keys(RUMOR_STATUS_LABEL) as RumorStatus[]).map((s) => (
                <option key={s} value={s}>
                  {RUMOR_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <input
              value={rumor.source}
              onChange={(e) => update(rumor.id, { source: e.target.value })}
              disabled={!isGM}
              placeholder="Fonte (quem contou)"
              className={`flex-1 min-w-[140px] border border-stone-300 rounded-md px-2 py-1 text-xs ${GENERAL_FIELD_DISABLED_CLASS}`}
            />
            {isGM && (
              <button onClick={() => remove(rumor.id)} className="text-xs text-red-600 hover:underline">
                Excluir
              </button>
            )}
          </div>
          {isGM && (
            <textarea
              value={rumor.notes}
              onChange={(e) => update(rumor.id, { notes: e.target.value })}
              placeholder="Segredo do mestre sobre este rumor"
              className="w-full border border-amber-300 bg-amber-50 rounded-md px-2 py-1.5 text-sm"
              rows={2}
            />
          )}
          <PlayerNotesField value={rumor.playerNotes} onChange={(v) => update(rumor.id, { playerNotes: v })} />
        </div>
      ))}
    </div>
  );
}

function MoralTab({ morale, onChange }: { morale: import('../types').Morale; onChange: (m: import('../types').Morale) => void }) {
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState('');

  function applyDelta() {
    if (delta === 0) return;
    const score = Math.max(0, Math.min(100, morale.score + delta));
    onChange({
      ...morale,
      score,
      log: [{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), delta, note }, ...morale.log],
    });
    setDelta(0);
    setNote('');
  }

  const color = morale.score >= 66 ? 'bg-emerald-500' : morale.score >= 33 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-700">Moral atual</span>
          <span className="text-lg font-bold text-stone-900">{morale.score}/100</span>
        </div>
        <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${morale.score}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={morale.score}
          onChange={(e) => onChange({ ...morale, score: Number(e.target.value) })}
          className="w-full mt-3"
        />
      </div>

      <textarea
        value={morale.notes}
        onChange={(e) => onChange({ ...morale, notes: e.target.value })}
        placeholder="Notas gerais sobre o humor da população/grupo nesta cidade"
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white"
        rows={2}
      />

      <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
        <div className="text-sm font-medium text-stone-700">Registrar evento</div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
            className="w-24 border border-stone-300 rounded-md px-2 py-1.5 text-sm"
            placeholder="+/- moral"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="O que aconteceu"
            className="flex-1 min-w-[160px] border border-stone-300 rounded-md px-2 py-1.5 text-sm"
          />
          <SmallButton onClick={applyDelta}>
            Registrar
          </SmallButton>
        </div>
        {morale.log.length > 0 && (
          <ul className="text-xs text-stone-600 space-y-1 pt-1">
            {morale.log.map((entry) => (
              <li key={entry.id} className="flex gap-2">
                <span className="text-stone-400 shrink-0">{entry.date}</span>
                <span className={entry.delta >= 0 ? 'text-emerald-700 font-medium' : 'text-red-700 font-medium'}>
                  {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                </span>
                <span>{entry.note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="text-center py-8 text-stone-400 text-sm bg-white border border-dashed border-stone-300 rounded-xl">{text}</div>;
}
