import { getClass } from '../../data/classes';
import { getBackground } from '../../data/backgrounds';
import { SelectableCard } from '../../components/SelectableCard';
import { useWizardStore } from '../../store/wizardStore';

export function StepEquipment() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  const classDef = getClass(draft.classId);
  const background = getBackground(draft.backgroundId);
  if (!classDef || !background) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Equipamento Inicial</h2>
        <p className="text-sm text-stone-600 mb-4">Escolha um pacote de equipamento da sua classe e um do seu antecedente.</p>

        <h3 className="font-semibold text-stone-800 mb-2">Equipamento de {classDef.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {classDef.startingEquipmentOptions.map((opt) => (
            <SelectableCard
              key={opt.id}
              title={opt.label}
              selected={draft.classEquipmentOptionId === opt.id}
              onClick={() => setDraft({ classEquipmentOptionId: opt.id })}
            />
          ))}
        </div>

        <h3 className="font-semibold text-stone-800 mb-2">Equipamento de {background.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {background.equipmentOptions.map((opt) => (
            <SelectableCard
              key={opt.id}
              title={opt.label}
              selected={draft.backgroundEquipmentOptionId === opt.id}
              onClick={() => setDraft({ backgroundEquipmentOptionId: opt.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function canProceedEquipment(draft: { classEquipmentOptionId: string; backgroundEquipmentOptionId: string }): boolean {
  return Boolean(draft.classEquipmentOptionId) && Boolean(draft.backgroundEquipmentOptionId);
}
