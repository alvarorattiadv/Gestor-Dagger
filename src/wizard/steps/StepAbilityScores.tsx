import type { ReactNode } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { ABILITY_KEYS, ABILITY_LABELS } from '../../types/rules';
import type { AbilityKey } from '../../types/rules';
import { STANDARD_ARRAY, POINT_BUY_BUDGET, POINT_BUY_COST, pointBuyCost, isValidPointBuyScore } from '../../engine/abilityScores';
import { abilityModifier, formatModifier } from '../../engine/modifiers';
import type { AbilityGenerationMethod } from '../../types/character';

const METHOD_LABELS: Record<AbilityGenerationMethod, string> = {
  standard: 'Array Padrão',
  pointbuy: 'Compra por Pontos',
  manual: 'Manual',
};

export function StepAbilityScores() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  function switchMethod(method: AbilityGenerationMethod) {
    let scores = { ...draft.baseAbilityScores };
    if (method === 'pointbuy') {
      scores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
    } else if (method === 'standard') {
      scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    }
    setDraft({ abilityGenerationMethod: method, baseAbilityScores: scores });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Determine os Atributos</h2>
      <p className="text-sm text-stone-600 mb-4">Escolha um método para gerar Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma.</p>

      <div className="flex gap-2 mb-5">
        {(['standard', 'pointbuy', 'manual'] as AbilityGenerationMethod[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMethod(m)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${draft.abilityGenerationMethod === m ? 'bg-amber-700 text-white' : 'bg-white border border-stone-300'}`}
          >
            {METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {draft.abilityGenerationMethod === 'standard' && <StandardArrayEditor />}
      {draft.abilityGenerationMethod === 'pointbuy' && <PointBuyEditor />}
      {draft.abilityGenerationMethod === 'manual' && <ManualEditor />}
    </div>
  );
}

function AbilityRow({ ability, children }: { ability: AbilityKey; children: ReactNode }) {
  const draft = useWizardStore((s) => s.draft);
  const score = draft.baseAbilityScores[ability];
  const mod = abilityModifier(score);
  return (
    <div className="flex items-center justify-between bg-white border border-stone-300 rounded-lg px-4 py-2.5">
      <div className="font-medium text-stone-800 w-36">{ABILITY_LABELS[ability]}</div>
      <div className="flex items-center gap-3">
        {children}
        <div className="text-sm text-stone-500 w-12 text-right">{formatModifier(mod)}</div>
      </div>
    </div>
  );
}

function StandardArrayEditor() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  const usedValues = ABILITY_KEYS.map((k) => draft.baseAbilityScores[k]);

  function setValue(ability: AbilityKey, value: number) {
    setDraft({ baseAbilityScores: { ...draft.baseAbilityScores, [ability]: value } });
  }

  return (
    <div className="space-y-2">
      {ABILITY_KEYS.map((ability) => {
        const current = draft.baseAbilityScores[ability];
        const available = STANDARD_ARRAY.filter((v) => !usedValues.includes(v) || v === current);
        return (
          <AbilityRow key={ability} ability={ability}>
            <select
              className="border border-stone-300 rounded px-2 py-1"
              value={current}
              onChange={(e) => setValue(ability, Number(e.target.value))}
            >
              {[...new Set([current, ...available])].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </AbilityRow>
        );
      })}
    </div>
  );
}

function PointBuyEditor() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);
  const spent = pointBuyCost(draft.baseAbilityScores);
  const remaining = POINT_BUY_BUDGET - spent;

  function change(ability: AbilityKey, delta: number) {
    const next = draft.baseAbilityScores[ability] + delta;
    if (!isValidPointBuyScore(next)) return;
    const nextScores = { ...draft.baseAbilityScores, [ability]: next };
    if (pointBuyCost(nextScores) > POINT_BUY_BUDGET) return;
    setDraft({ baseAbilityScores: nextScores });
  }

  return (
    <div>
      <div className="mb-3 text-sm font-medium text-stone-700">Pontos restantes: {remaining} / {POINT_BUY_BUDGET}</div>
      <div className="space-y-2">
        {ABILITY_KEYS.map((ability) => {
          const score = draft.baseAbilityScores[ability];
          return (
            <AbilityRow key={ability} ability={ability}>
              <button type="button" onClick={() => change(ability, -1)} className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300" disabled={score <= 8}>
                −
              </button>
              <div className="w-8 text-center font-semibold">{score}</div>
              <button type="button" onClick={() => change(ability, 1)} className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300" disabled={score >= 15}>
                +
              </button>
              <div className="text-xs text-stone-400 w-16">custo {POINT_BUY_COST[score]}</div>
            </AbilityRow>
          );
        })}
      </div>
    </div>
  );
}

function ManualEditor() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  function setValue(ability: AbilityKey, value: number) {
    const clamped = Math.max(1, Math.min(30, value));
    setDraft({ baseAbilityScores: { ...draft.baseAbilityScores, [ability]: clamped } });
  }

  return (
    <div className="space-y-2">
      {ABILITY_KEYS.map((ability) => (
        <AbilityRow key={ability} ability={ability}>
          <input
            type="number"
            className="w-16 border border-stone-300 rounded px-2 py-1"
            value={draft.baseAbilityScores[ability]}
            onChange={(e) => setValue(ability, Number(e.target.value))}
          />
        </AbilityRow>
      ))}
    </div>
  );
}

export function canProceedAbilityScores(draft: { abilityGenerationMethod: AbilityGenerationMethod; baseAbilityScores: Record<AbilityKey, number> }): boolean {
  if (draft.abilityGenerationMethod === 'pointbuy') {
    return pointBuyCost(draft.baseAbilityScores) <= POINT_BUY_BUDGET;
  }
  return true;
}
