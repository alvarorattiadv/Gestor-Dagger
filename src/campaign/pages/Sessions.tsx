import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { SmallButton } from '../components/SmallButton';

export function Sessions() {
  const sessions = useCampaignStore((s) => s.campaign.sessions);
  const addSession = useCampaignStore((s) => s.addSession);
  const updateSession = useCampaignStore((s) => s.updateSession);
  const removeSession = useCampaignStore((s) => s.removeSession);
  const isGM = useRoleStore((s) => s.role === 'gm');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Diário de Sessões</h2>
          <p className="text-sm text-stone-500">Resuma cada sessão e deixe registrados os ganchos em aberto para a próxima.</p>
        </div>
        <SmallButton onClick={addSession}>
          + Nova sessão
        </SmallButton>
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-16 text-stone-500 bg-white border border-stone-200 rounded-xl">Nenhuma sessão registrada ainda.</div>
      )}

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={session.date}
                onChange={(e) => updateSession(session.id, (s) => ({ ...s, date: e.target.value }))}
                className="border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              />
              <input
                value={session.title}
                onChange={(e) => updateSession(session.id, (s) => ({ ...s, title: e.target.value }))}
                className="flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold"
                placeholder="Título da sessão"
              />
              {isGM && (
                <button onClick={() => removeSession(session.id)} className="text-xs text-red-600 hover:underline shrink-0 px-1">
                  Excluir
                </button>
              )}
            </div>
            <textarea
              value={session.summary}
              onChange={(e) => updateSession(session.id, (s) => ({ ...s, summary: e.target.value }))}
              placeholder="Resumo do que aconteceu"
              className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              rows={3}
            />
            <textarea
              value={session.hooks}
              onChange={(e) => updateSession(session.id, (s) => ({ ...s, hooks: e.target.value }))}
              placeholder="Ganchos deixados em aberto para a próxima sessão"
              className="w-full border border-violet-300 bg-violet-50 rounded-md px-2 py-1.5 text-sm"
              rows={2}
            />
            <input
              value={session.lootXp}
              onChange={(e) => updateSession(session.id, (s) => ({ ...s, lootXp: e.target.value }))}
              placeholder="Loot, XP, marcos concedidos..."
              className="w-full border border-stone-200 rounded-md px-2 py-1 text-xs text-stone-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
