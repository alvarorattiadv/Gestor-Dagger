import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { SmallButton } from '../components/SmallButton';
import { PlayerNotesField, GENERAL_FIELD_DISABLED_CLASS } from '../components/PlayerNotesField';
import type { Faction, GlobalNpc } from '../types';

export function NpcsFactions() {
  const globalNpcs = useCampaignStore((s) => s.campaign.globalNpcs);
  const factions = useCampaignStore((s) => s.campaign.factions);
  const cities = useCampaignStore((s) => s.campaign.cities);
  const addGlobalNpc = useCampaignStore((s) => s.addGlobalNpc);
  const updateGlobalNpc = useCampaignStore((s) => s.updateGlobalNpc);
  const removeGlobalNpc = useCampaignStore((s) => s.removeGlobalNpc);
  const addFaction = useCampaignStore((s) => s.addFaction);
  const updateFaction = useCampaignStore((s) => s.updateFaction);
  const removeFaction = useCampaignStore((s) => s.removeFaction);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-stone-900">NPCs & Facções</h2>
        <p className="text-sm text-stone-500">NPCs recorrentes que não pertencem a uma única cidade, e organizações que movem os fios da campanha.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800">NPCs Globais</h3>
          <SmallButton onClick={addGlobalNpc}>+ NPC</SmallButton>
        </div>
        {globalNpcs.length === 0 && <EmptyHint text="Nenhum NPC global cadastrado ainda." />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {globalNpcs.map((npc) => (
            <GlobalNpcCard
              key={npc.id}
              npc={npc}
              cities={cities}
              onUpdate={(patch) => updateGlobalNpc(npc.id, (n) => ({ ...n, ...patch }))}
              onRemove={() => removeGlobalNpc(npc.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800">Facções</h3>
          <SmallButton onClick={addFaction}>+ Facção</SmallButton>
        </div>
        {factions.length === 0 && <EmptyHint text="Nenhuma facção cadastrada ainda." />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {factions.map((faction) => (
            <FactionCard
              key={faction.id}
              faction={faction}
              cities={cities}
              onUpdate={(patch) => updateFaction(faction.id, (f) => ({ ...f, ...patch }))}
              onRemove={() => removeFaction(faction.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GlobalNpcCard({
  npc,
  cities,
  onUpdate,
  onRemove,
}: {
  npc: GlobalNpc;
  cities: { id: string; name: string }[];
  onUpdate: (patch: Partial<GlobalNpc>) => void;
  onRemove: () => void;
}) {
  const isGM = useRoleStore((s) => s.role === 'gm');
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
      <div className="flex gap-2">
        <input
          value={npc.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          disabled={!isGM}
          placeholder="Nome"
          className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold ${GENERAL_FIELD_DISABLED_CLASS}`}
        />
        <input
          value={npc.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
          disabled={!isGM}
          placeholder="Papel/ocupação"
          className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
        />
        {isGM && (
          <button onClick={onRemove} className="text-xs text-red-600 hover:underline shrink-0 px-1">
            Excluir
          </button>
        )}
      </div>
      <textarea
        value={npc.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        disabled={!isGM}
        placeholder="Descrição, personalidade, ganchos..."
        className={`w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
        rows={2}
      />
      {isGM && (
        <textarea
          value={npc.secret}
          onChange={(e) => onUpdate({ secret: e.target.value })}
          placeholder="Segredo do mestre"
          className="w-full border border-amber-300 bg-amber-50 rounded-md px-2 py-1.5 text-sm"
          rows={2}
        />
      )}
      <PlayerNotesField value={npc.playerNotes} onChange={(v) => onUpdate({ playerNotes: v })} />
      <select
        value={npc.cityId ?? ''}
        onChange={(e) => onUpdate({ cityId: e.target.value || undefined })}
        disabled={!isGM}
        className={`w-full border border-stone-300 rounded-md px-2 py-1 text-xs bg-stone-50 ${GENERAL_FIELD_DISABLED_CLASS}`}
      >
        <option value="">Sem cidade associada</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function FactionCard({
  faction,
  cities,
  onUpdate,
  onRemove,
}: {
  faction: Faction;
  cities: { id: string; name: string }[];
  onUpdate: (patch: Partial<Faction>) => void;
  onRemove: () => void;
}) {
  const isGM = useRoleStore((s) => s.role === 'gm');
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
      <div className="flex gap-2">
        <input
          value={faction.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          disabled={!isGM}
          placeholder="Nome da facção"
          className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold ${GENERAL_FIELD_DISABLED_CLASS}`}
        />
        {isGM && (
          <button onClick={onRemove} className="text-xs text-red-600 hover:underline shrink-0 px-1">
            Excluir
          </button>
        )}
      </div>
      <input
        value={faction.leader}
        onChange={(e) => onUpdate({ leader: e.target.value })}
        disabled={!isGM}
        placeholder="Líder"
        className={`w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
      />
      <textarea
        value={faction.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        disabled={!isGM}
        placeholder="Objetivos, área de atuação, aliados/inimigos..."
        className={`w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
        rows={2}
      />
      {isGM && (
        <textarea
          value={faction.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Notas do mestre"
          className="w-full border border-amber-300 bg-amber-50 rounded-md px-2 py-1.5 text-sm"
          rows={2}
        />
      )}
      <PlayerNotesField value={faction.playerNotes} onChange={(v) => onUpdate({ playerNotes: v })} />
      <select
        value={faction.cityId ?? ''}
        onChange={(e) => onUpdate({ cityId: e.target.value || undefined })}
        disabled={!isGM}
        className={`w-full border border-stone-300 rounded-md px-2 py-1 text-xs bg-stone-50 ${GENERAL_FIELD_DISABLED_CLASS}`}
      >
        <option value="">Sem sede associada</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="text-center py-8 text-stone-400 text-sm bg-white border border-dashed border-stone-300 rounded-xl">{text}</div>;
}
