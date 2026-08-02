import { SPECIES } from '../../data/species';
import { SelectableCard } from '../../components/SelectableCard';
import { useWizardStore } from '../../store/wizardStore';

export function StepSpecies() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  const species = SPECIES.find((s) => s.id === draft.speciesId);

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Escolha a Espécie</h2>
      <p className="text-sm text-stone-600 mb-4">Sua espécie define traços inatos, tamanho e deslocamento.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SPECIES.map((sp) => (
          <SelectableCard
            key={sp.id}
            title={sp.name}
            description={sp.description}
            selected={draft.speciesId === sp.id}
            onClick={() => setDraft({ speciesId: sp.id, lineageId: '' })}
          />
        ))}
      </div>

      {species && (
        <div className="mt-5 bg-stone-100 rounded-lg p-4">
          <div className="text-sm text-stone-700 mb-2">
            Tamanho: <strong>{species.size}</strong> · Deslocamento: <strong>{species.speed}m</strong>
          </div>
          <ul className="text-sm text-stone-700 space-y-1 list-disc list-inside">
            {species.traits.map((t) => (
              <li key={t.name}>
                <strong>{t.name}:</strong> {t.description}
              </li>
            ))}
          </ul>

          {species.lineages && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-stone-900 mb-2">Escolha uma linhagem</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {species.lineages.map((lin) => (
                  <SelectableCard
                    key={lin.id}
                    title={lin.name}
                    description={lin.description}
                    selected={draft.lineageId === lin.id}
                    onClick={() => setDraft({ lineageId: lin.id })}
                  >
                    <div className="text-xs text-stone-500 mt-2">
                      {lin.grantedTraits.map((t) => t.name).join(', ')}
                    </div>
                  </SelectableCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function canProceedSpecies(draft: { speciesId: string; lineageId: string }): boolean {
  const species = SPECIES.find((s) => s.id === draft.speciesId);
  if (!species) return false;
  if (species.lineages && !draft.lineageId) return false;
  return true;
}
