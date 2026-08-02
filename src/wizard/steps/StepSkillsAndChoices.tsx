import { getClass } from '../../data/classes';
import { getBackground } from '../../data/backgrounds';
import { getFeat } from '../../data/feats';
import { useWizardStore } from '../../store/wizardStore';
import { SKILL_INFO, SKILL_KEYS } from '../../types/rules';
import type { SkillKey } from '../../types/rules';

export function StepSkillsAndChoices() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  const classDef = getClass(draft.classId);
  const background = getBackground(draft.backgroundId);
  if (!classDef || !background) return null;

  const bgSkills = new Set(background.skillProficiencies);
  const availableSkillChoices = classDef.skillChoices.filter((s) => !bgSkills.has(s));

  const originFeat = getFeat(background.featId);
  const featSkillGrant = originFeat?.skillGrant;
  const featSkillSelections = draft.featSkillSelections[background.featId] ?? [];
  const alreadyProficient = new Set([...background.skillProficiencies, ...draft.classSkillSelections]);

  function toggleFeatSkill(skill: SkillKey) {
    const current = draft.featSkillSelections[background!.featId] ?? [];
    const has = current.includes(skill);
    let next: SkillKey[];
    if (has) {
      next = current.filter((s) => s !== skill);
    } else if (current.length < (featSkillGrant?.count ?? 0)) {
      next = [...current, skill];
    } else {
      next = current;
    }
    setDraft({ featSkillSelections: { ...draft.featSkillSelections, [background!.featId]: next } });
  }

  function toggleSkill(skill: SkillKey) {
    const has = draft.classSkillSelections.includes(skill);
    if (has) {
      setDraft({ classSkillSelections: draft.classSkillSelections.filter((s) => s !== skill) });
    } else if (draft.classSkillSelections.length < classDef!.skillChoiceCount) {
      setDraft({ classSkillSelections: [...draft.classSkillSelections, skill] });
    }
  }

  const proficientSkills = new Set([...background.skillProficiencies, ...draft.classSkillSelections]);

  const level1Choices = classDef.features.filter((f) => f.level === 1 && f.choice);

  function toggleChoiceOption(choiceId: string, optionId: string, count: number) {
    const current = draft.classChoiceSelections[choiceId] ?? [];
    const has = current.includes(optionId);
    let next: string[];
    if (has) {
      next = current.filter((id) => id !== optionId);
    } else if (count === 1) {
      next = [optionId];
    } else if (current.length < count) {
      next = [...current, optionId];
    } else {
      next = current;
    }
    setDraft({ classChoiceSelections: { ...draft.classChoiceSelections, [choiceId]: next } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Perícias e Escolhas de Classe</h2>
        <p className="text-sm text-stone-600 mb-4">
          Escolha {classDef.skillChoiceCount} perícia(s) da lista de {classDef.name} ({draft.classSkillSelections.length}/{classDef.skillChoiceCount} selecionadas).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableSkillChoices.map((skill) => {
            const selected = draft.classSkillSelections.includes(skill);
            const disabled = !selected && draft.classSkillSelections.length >= classDef.skillChoiceCount;
            return (
              <button
                key={skill}
                type="button"
                disabled={disabled}
                onClick={() => toggleSkill(skill)}
                className={`text-sm px-3 py-2 rounded border text-left ${
                  selected ? 'bg-amber-700 text-white border-amber-700' : 'bg-white border-stone-300 hover:border-amber-400 disabled:opacity-40'
                }`}
              >
                {SKILL_INFO[skill].label}
              </button>
            );
          })}
        </div>
      </div>

      {featSkillGrant && (
        <div>
          <h3 className="font-semibold text-stone-900 mb-1">{originFeat!.name}</h3>
          <p className="text-sm text-stone-600 mb-3">
            Escolha {featSkillGrant.count} perícia(s) para ganhar proficiência ({featSkillSelections.length}/{featSkillGrant.count} selecionadas).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SKILL_KEYS.filter((skill) => !alreadyProficient.has(skill)).map((skill) => {
              const selected = featSkillSelections.includes(skill);
              const disabled = !selected && featSkillSelections.length >= featSkillGrant.count;
              return (
                <button
                  key={skill}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleFeatSkill(skill)}
                  className={`text-sm px-3 py-2 rounded border text-left ${
                    selected ? 'bg-amber-700 text-white border-amber-700' : 'bg-white border-stone-300 hover:border-amber-400 disabled:opacity-40'
                  }`}
                >
                  {SKILL_INFO[skill].label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {level1Choices.map((feature) => {
        const choice = feature.choice!;
        const selections = draft.classChoiceSelections[choice.id] ?? [];
        const options = choice.id === 'especializacao' ? choice.options.filter((o) => proficientSkills.has(o.id as SkillKey)) : choice.options;
        return (
          <div key={feature.id}>
            <h3 className="font-semibold text-stone-900 mb-1">{feature.name}</h3>
            <p className="text-sm text-stone-600 mb-3">{choice.label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((option) => {
                const selected = selections.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleChoiceOption(choice.id, option.id, choice.count)}
                    className={`text-left text-sm px-3 py-2 rounded border ${
                      selected ? 'bg-amber-700 text-white border-amber-700' : 'bg-white border-stone-300 hover:border-amber-400'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && <div className={`text-xs mt-0.5 ${selected ? 'text-amber-100' : 'text-stone-500'}`}>{option.description}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function canProceedSkillsAndChoices(draft: {
  classId: string;
  backgroundId: string;
  classSkillSelections: string[];
  classChoiceSelections: Record<string, string[]>;
  featSkillSelections: Record<string, string[]>;
}): boolean {
  const classDef = getClass(draft.classId);
  if (!classDef) return false;
  if (draft.classSkillSelections.length !== classDef.skillChoiceCount) return false;
  const background = getBackground(draft.backgroundId);
  const featSkillGrant = background ? getFeat(background.featId)?.skillGrant : undefined;
  if (featSkillGrant && (draft.featSkillSelections[background!.featId] ?? []).length !== featSkillGrant.count) return false;
  const level1Choices = classDef.features.filter((f) => f.level === 1 && f.choice);
  return level1Choices.every((f) => (draft.classChoiceSelections[f.choice!.id] ?? []).length === f.choice!.count);
}
