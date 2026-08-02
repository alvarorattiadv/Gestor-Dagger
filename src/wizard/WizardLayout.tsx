import type { ReactElement } from 'react';
import { useWizardStore } from '../store/wizardStore';
import { getClass } from '../data/classes';
import { getBackground } from '../data/backgrounds';
import { classSpellGrantSource, featSpellGrantSources } from '../data/spellGrants';
import { abilityModifier } from '../engine/modifiers';
import { Button } from '../components/Button';
import { finalAbilityScores } from './buildCharacter';
import { StepSpecies, canProceedSpecies } from './steps/StepSpecies';
import { StepClass, canProceedClass } from './steps/StepClass';
import { StepBackground, canProceedBackground } from './steps/StepBackground';
import { StepAbilityScores, canProceedAbilityScores } from './steps/StepAbilityScores';
import { StepSkillsAndChoices, canProceedSkillsAndChoices } from './steps/StepSkillsAndChoices';
import { StepEquipment, canProceedEquipment } from './steps/StepEquipment';
import { StepSpells, canProceedSpells } from './steps/StepSpells';
import { StepReview } from './steps/StepReview';
import type { WizardDraft } from './types';

interface StepDef {
  title: string;
  Component: () => ReactElement | null;
  canProceed: (draft: WizardDraft) => boolean;
}

const STEPS: StepDef[] = [
  { title: 'Espécie', Component: StepSpecies, canProceed: canProceedSpecies },
  { title: 'Classe', Component: StepClass, canProceed: canProceedClass },
  { title: 'Antecedente', Component: StepBackground, canProceed: canProceedBackground },
  { title: 'Atributos', Component: StepAbilityScores, canProceed: canProceedAbilityScores },
  { title: 'Perícias', Component: StepSkillsAndChoices, canProceed: canProceedSkillsAndChoices },
  { title: 'Equipamento', Component: StepEquipment, canProceed: canProceedEquipment },
  { title: 'Magias', Component: StepSpells, canProceed: canProceedSpells },
  { title: 'Revisão', Component: StepReview, canProceed: () => true },
];

function isSpellStepApplicable(draft: WizardDraft): boolean {
  const classDef = getClass(draft.classId);
  const background = getBackground(draft.backgroundId);
  const scores = finalAbilityScores(draft);
  const classSource = classDef ? classSpellGrantSource(classDef, 1, abilityModifier(scores[classDef.spellcasting?.ability ?? 'int'])) : null;
  const featSources = background ? featSpellGrantSources([background.featId]) : [];
  return Boolean(classSource) || featSources.length > 0;
}

export function WizardLayout() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  const spellStepIndex = 6;
  const skipSpellStep = !isSpellStepApplicable(draft);

  function nextStepIndex(from: number): number {
    let next = from + 1;
    if (next === spellStepIndex && skipSpellStep) next += 1;
    return Math.min(next, STEPS.length - 1);
  }

  function prevStepIndex(from: number): number {
    let prev = from - 1;
    if (prev === spellStepIndex && skipSpellStep) prev -= 1;
    return Math.max(prev, 0);
  }

  const current = STEPS[draft.step];
  const canProceed = current.canProceed(draft);
  const isLastStep = draft.step === STEPS.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <ol className="flex flex-wrap gap-x-4 gap-y-2 mb-6 text-xs">
        {(() => {
          let visibleCount = 0;
          return STEPS.map((step, index) => {
            if (index === spellStepIndex && skipSpellStep) return null;
            visibleCount += 1;
            const active = index === draft.step;
            const done = index < draft.step;
            return (
              <li key={step.title} className={`flex items-center gap-1.5 ${active ? 'text-amber-800 font-semibold' : done ? 'text-stone-500' : 'text-stone-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${active ? 'bg-amber-700 text-white' : done ? 'bg-stone-300' : 'bg-stone-200'}`}>
                  {visibleCount}
                </span>
                {step.title}
              </li>
            );
          });
        })()}
      </ol>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <current.Component />
      </div>

      {!isLastStep && (
        <div className="mt-5 flex justify-between">
          <Button variant="secondary" onClick={() => setDraft({ step: prevStepIndex(draft.step) })} disabled={draft.step === 0}>
            Voltar
          </Button>
          <Button onClick={() => setDraft({ step: nextStepIndex(draft.step) })} disabled={!canProceed}>
            Próximo
          </Button>
        </div>
      )}
      {isLastStep && (
        <div className="mt-5 flex justify-start">
          <Button variant="secondary" onClick={() => setDraft({ step: prevStepIndex(draft.step) })}>
            Voltar
          </Button>
        </div>
      )}
    </div>
  );
}
