import { CLASSES } from '../../data/classes';
import { SelectableCard } from '../../components/SelectableCard';
import { useWizardStore } from '../../store/wizardStore';
import { ABILITY_LABELS } from '../../types/rules';

export function StepClass() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  const classDef = CLASSES.find((c) => c.id === draft.classId);

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Escolha a Classe</h2>
      <p className="text-sm text-stone-600 mb-4">Sua classe define seu papel em combate, dado de vida e progressão.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CLASSES.map((c) => (
          <SelectableCard
            key={c.id}
            title={c.name}
            description={c.description}
            selected={draft.classId === c.id}
            onClick={() => setDraft({ classId: c.id, classSkillSelections: [], classChoiceSelections: {}, classEquipmentOptionId: '' })}
          >
            <div className="text-xs text-stone-500 mt-2">Dado de Vida: d{c.hitDie}</div>
          </SelectableCard>
        ))}
      </div>

      {classDef && (
        <div className="mt-5 bg-stone-100 rounded-lg p-4 text-sm text-stone-700 space-y-1">
          <div>
            <strong>Habilidades primárias:</strong> {classDef.primaryAbilities.map((a) => ABILITY_LABELS[a]).join(', ')}
          </div>
          <div>
            <strong>Resistências:</strong> {classDef.savingThrowProficiencies.map((a) => ABILITY_LABELS[a]).join(', ')}
          </div>
          <div>
            <strong>Armadura:</strong> {classDef.armorProficiencies.length ? classDef.armorProficiencies.join(', ') : 'Nenhuma'}
          </div>
          {classDef.spellcasting && (
            <div>
              <strong>Conjuração:</strong> conjurador completo ({ABILITY_LABELS[classDef.spellcasting.ability]})
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function canProceedClass(draft: { classId: string }): boolean {
  return Boolean(draft.classId);
}
