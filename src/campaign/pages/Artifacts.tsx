import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { SmallButton } from '../components/SmallButton';
import { PlayerNotesField, GENERAL_FIELD_DISABLED_CLASS } from '../components/PlayerNotesField';
import type { Artifact, ArtifactStatus } from '../types';

const STATUS_LABEL: Record<ArtifactStatus, string> = {
  confirmado: 'Confirmado',
  mito: 'Mito',
  destruido: 'Destruído',
};
const STATUS_CLASS: Record<ArtifactStatus, string> = {
  confirmado: 'bg-emerald-200 text-emerald-900',
  mito: 'bg-amber-200 text-amber-900',
  destruido: 'bg-stone-300 text-stone-700',
};

export function Artifacts() {
  const artifacts = useCampaignStore((s) => s.campaign.artifacts);
  const addArtifact = useCampaignStore((s) => s.addArtifact);
  const updateArtifact = useCampaignStore((s) => s.updateArtifact);
  const removeArtifact = useCampaignStore((s) => s.removeArtifact);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Artefatos Históricos</h2>
          <p className="text-sm text-stone-500">Itens lendários da campanha — o que é real, o que é lenda e o que já se perdeu.</p>
        </div>
        <SmallButton onClick={addArtifact}>+ Artefato</SmallButton>
      </div>

      {artifacts.length === 0 && (
        <div className="text-center py-16 text-stone-500 bg-white border border-stone-200 rounded-xl">Nenhum artefato registrado ainda.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            onUpdate={(patch) => updateArtifact(artifact.id, (a) => ({ ...a, ...patch }))}
            onRemove={() => removeArtifact(artifact.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ArtifactCard({
  artifact,
  onUpdate,
  onRemove,
}: {
  artifact: Artifact;
  onUpdate: (patch: Partial<Artifact>) => void;
  onRemove: () => void;
}) {
  const isGM = useRoleStore((s) => s.role === 'gm');
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
      <div className="flex gap-2">
        <input
          value={artifact.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          disabled={!isGM}
          placeholder="Nome do artefato"
          className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold ${GENERAL_FIELD_DISABLED_CLASS}`}
        />
        {isGM && (
          <button onClick={onRemove} className="text-xs text-red-600 hover:underline shrink-0 px-1">
            Excluir
          </button>
        )}
      </div>
      <textarea
        value={artifact.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        disabled={!isGM}
        placeholder="Origem, poderes, história..."
        className={`w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
        rows={2}
      />
      <div className="flex gap-1.5">
        {(Object.keys(STATUS_LABEL) as ArtifactStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => onUpdate({ status })}
            disabled={!isGM}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-colors disabled:cursor-default ${
              artifact.status === status ? `${STATUS_CLASS[status]} border-transparent` : 'bg-white border-stone-300 text-stone-500'
            }`}
          >
            {STATUS_LABEL[status]}
          </button>
        ))}
      </div>
      {artifact.status === 'confirmado' && (
        <div className="space-y-2 bg-emerald-50 border border-emerald-200 rounded-md p-2">
          <input
            value={artifact.possibleLocation}
            onChange={(e) => onUpdate({ possibleLocation: e.target.value })}
            disabled={!isGM}
            placeholder="Possível local"
            className="w-full border border-emerald-300 rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-emerald-50/60 disabled:text-stone-500 disabled:cursor-default"
          />
          <input
            value={artifact.possibleOwner}
            onChange={(e) => onUpdate({ possibleOwner: e.target.value })}
            disabled={!isGM}
            placeholder="Possível atual possuidor"
            className="w-full border border-emerald-300 rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-emerald-50/60 disabled:text-stone-500 disabled:cursor-default"
          />
        </div>
      )}
      {isGM && (
        <textarea
          value={artifact.gmSecret}
          onChange={(e) => onUpdate({ gmSecret: e.target.value })}
          placeholder="Segredo do mestre"
          className="w-full border border-amber-300 bg-amber-50 rounded-md px-2 py-1.5 text-sm"
          rows={2}
        />
      )}
      <PlayerNotesField value={artifact.playerNotes} onChange={(v) => onUpdate({ playerNotes: v })} />
    </div>
  );
}
