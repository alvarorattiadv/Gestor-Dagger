import { Link } from 'react-router-dom';
import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { PlayerNotesField, GENERAL_FIELD_DISABLED_CLASS } from '../components/PlayerNotesField';
import { PendingApprovals } from '../components/PendingApprovals';

export function Party() {
  const party = useCampaignStore((s) => s.campaign.party);
  const setFear = useCampaignStore((s) => s.setFear);
  const addPlayer = useCampaignStore((s) => s.addPlayer);
  const updatePlayer = useCampaignStore((s) => s.updatePlayer);
  const removePlayer = useCampaignStore((s) => s.removePlayer);
  const isGM = useRoleStore((s) => s.role === 'gm');
  const userId = useRoleStore((s) => s.user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-stone-900">Grupo & Recursos</h2>
        <p className="text-sm text-stone-500">
          Acompanhe o Medo do mestre e mantenha uma referência rápida do grupo. Esperança é individual — acompanhe na ficha de cada personagem.
        </p>
      </div>

      {isGM && <PendingApprovals />}

      <div className="max-w-sm">
        <ResourceCounter label="Medo do mestre" value={party.fear} onChange={setFear} dotClass="bg-violet-600" max={12} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-stone-800">Personagens</h3>
          <button onClick={() => addPlayer(isGM ? undefined : userId)} className="text-xs font-medium text-violet-700 hover:underline">
            + Personagem
          </button>
        </div>
        {party.players.length === 0 && (
          <div className="text-center py-10 text-stone-400 text-sm bg-white border border-dashed border-stone-300 rounded-xl">
            Nenhum personagem cadastrado ainda.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {party.players.map((player) => {
            const isOwner = Boolean(userId) && player.linkedUserId === userId;
            const canEditIdentity = isGM || isOwner;
            return (
              <div key={player.id} className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={player.charName}
                    onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, charName: e.target.value }))}
                    disabled={!canEditIdentity}
                    placeholder="Nome do personagem"
                    className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold ${GENERAL_FIELD_DISABLED_CLASS}`}
                  />
                  {isGM && (
                    <button onClick={() => removePlayer(player.id)} className="text-xs text-red-600 hover:underline shrink-0 px-1">
                      Excluir
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={player.playerName}
                    onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, playerName: e.target.value }))}
                    disabled={!canEditIdentity}
                    placeholder="Jogador(a)"
                    className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
                  />
                  <input
                    value={player.ancestryClass}
                    onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, ancestryClass: e.target.value }))}
                    disabled={!canEditIdentity}
                    placeholder="Ascendência / Classe"
                    className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
                  />
                </div>
                <textarea
                  value={player.notes}
                  onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, notes: e.target.value }))}
                  disabled={!isGM}
                  placeholder="Motivações, laços (visão do mestre)"
                  className={`w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
                  rows={2}
                />
                {isGM && (
                  <textarea
                    value={player.gmSecret}
                    onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, gmSecret: e.target.value }))}
                    placeholder="Segredo do mestre sobre este personagem"
                    className="w-full border border-amber-300 bg-amber-50 rounded-md px-2 py-1.5 text-sm"
                    rows={2}
                  />
                )}
                <PlayerNotesField
                  value={player.playerNotes}
                  onChange={(v) => updatePlayer(player.id, (p) => ({ ...p, playerNotes: v }))}
                  placeholder="Como o jogador vê a evolução do próprio personagem"
                />
                <Link to={`/campanha/grupo/${player.id}`} className="block text-center text-xs font-semibold text-violet-700 hover:underline py-1">
                  Abrir ficha (nível {player.level}
                  {player.classId ? '' : ' · sem classe'})
                </Link>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                  {player.linkedUserId ? (
                    <span className="text-emerald-700 font-medium">🔗 Vinculado a uma conta</span>
                  ) : (
                    <span className="text-stone-400">Não vinculado a nenhuma conta</span>
                  )}
                  {!isGM && !player.linkedUserId && userId && (
                    <button
                      onClick={() => updatePlayer(player.id, (p) => ({ ...p, linkedUserId: userId }))}
                      className="text-violet-700 hover:underline font-medium"
                    >
                      Este é o meu personagem
                    </button>
                  )}
                  {(isGM || isOwner) && player.linkedUserId && (
                    <button
                      onClick={() => updatePlayer(player.id, (p) => ({ ...p, linkedUserId: undefined }))}
                      className="text-stone-500 hover:underline"
                    >
                      Desvincular
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResourceCounter({
  label,
  value,
  onChange,
  dotClass,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  dotClass: string;
  max?: number;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(value - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-amber-700 text-amber-900 bg-white hover:bg-amber-50 text-sm font-medium"
          >
            −
          </button>
          <span className="text-xl font-bold text-stone-900 w-8 text-center">{value}</span>
          <button
            onClick={() => onChange(value + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-amber-700 text-amber-900 bg-white hover:bg-amber-50 text-sm font-medium"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`w-4 h-4 rounded-full ${i < value ? dotClass : 'bg-stone-200'}`} />
        ))}
      </div>
    </div>
  );
}
