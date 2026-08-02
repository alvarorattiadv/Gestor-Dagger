import { useState } from 'react';
import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { SmallButton } from '../components/SmallButton';
import type { ThreadStatus } from '../types';

const STATUS_LABEL: Record<ThreadStatus, string> = {
  ativo: 'Ativo',
  concluido: 'Concluído',
  esquecido: 'Esquecido',
};
const STATUS_CLASS: Record<ThreadStatus, string> = {
  ativo: 'bg-violet-200 text-violet-900',
  concluido: 'bg-emerald-200 text-emerald-900',
  esquecido: 'bg-stone-200 text-stone-600',
};

export function Threads() {
  const threads = useCampaignStore((s) => s.campaign.threads);
  const cities = useCampaignStore((s) => s.campaign.cities);
  const addThread = useCampaignStore((s) => s.addThread);
  const updateThread = useCampaignStore((s) => s.updateThread);
  const removeThread = useCampaignStore((s) => s.removeThread);
  const isGM = useRoleStore((s) => s.role === 'gm');
  const [filter, setFilter] = useState<ThreadStatus | 'todos'>('ativo');

  const filtered = filter === 'todos' ? threads : threads.filter((t) => t.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Fios Narrativos & Missões</h2>
          <p className="text-sm text-stone-500">O que está em jogo, o que foi resolvido e o que ficou esquecido pelo caminho.</p>
        </div>
        <SmallButton onClick={addThread}>
          + Novo fio
        </SmallButton>
      </div>

      <div className="flex gap-1">
        {(['ativo', 'concluido', 'esquecido', 'todos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === f ? 'bg-violet-700 text-white' : 'bg-white text-stone-600 border border-stone-300'}`}
          >
            {f === 'todos' ? 'Todos' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-stone-400 bg-white border border-dashed border-stone-300 rounded-xl text-sm">Nada por aqui.</div>
      )}

      <div className="space-y-3">
        {filtered.map((thread) => (
          <div key={thread.id} className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <input
                value={thread.title}
                onChange={(e) => updateThread(thread.id, (t) => ({ ...t, title: e.target.value }))}
                className="flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold"
              />
              <select
                value={thread.status}
                onChange={(e) => updateThread(thread.id, (t) => ({ ...t, status: e.target.value as ThreadStatus }))}
                className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 ${STATUS_CLASS[thread.status]}`}
              >
                {(Object.keys(STATUS_LABEL) as ThreadStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              {isGM && (
                <button onClick={() => removeThread(thread.id)} className="text-xs text-red-600 hover:underline shrink-0">
                  Excluir
                </button>
              )}
            </div>
            <textarea
              value={thread.description}
              onChange={(e) => updateThread(thread.id, (t) => ({ ...t, description: e.target.value }))}
              className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              rows={2}
              placeholder="Detalhes do fio narrativo"
            />
            <select
              value={thread.cityId ?? ''}
              onChange={(e) => updateThread(thread.id, (t) => ({ ...t, cityId: e.target.value || undefined }))}
              className="border border-stone-300 rounded-md px-2 py-1 text-xs bg-stone-50"
            >
              <option value="">Sem cidade associada</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
