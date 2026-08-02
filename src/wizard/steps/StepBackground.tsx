import { useState } from 'react';
import { BACKGROUNDS } from '../../data/backgrounds';
import { getFeat } from '../../data/feats';
import { SelectableCard } from '../../components/SelectableCard';
import { useWizardStore } from '../../store/wizardStore';
import { ABILITY_LABELS, SKILL_INFO } from '../../types/rules';
import type { AbilityKey } from '../../types/rules';

type Mode = 'twoOne' | 'oneOneOne';

export function StepBackground() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);
  const [mode, setMode] = useState<Mode>('twoOne');
  const [highAbility, setHighAbility] = useState<AbilityKey | ''>('');
  const [lowAbility, setLowAbility] = useState<AbilityKey | ''>('');

  const background = BACKGROUNDS.find((b) => b.id === draft.backgroundId);
  const feat = background ? getFeat(background.featId) : undefined;

  function selectBackground(id: string) {
    setDraft({ backgroundId: id, backgroundAbilityBonuses: {} });
    setHighAbility('');
    setLowAbility('');
  }

  function applyTwoOne(high: AbilityKey | '', low: AbilityKey | '') {
    if (!high || !low || high === low) return;
    setDraft({ backgroundAbilityBonuses: { [high]: 2, [low]: 1 } });
  }

  function applyOneOneOne() {
    if (!background) return;
    const bonuses: Partial<Record<AbilityKey, number>> = {};
    background.abilityBonusChoice.abilities.forEach((a) => (bonuses[a] = 1));
    setDraft({ backgroundAbilityBonuses: bonuses });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Escolha o Antecedente</h2>
      <p className="text-sm text-stone-600 mb-4">Seu antecedente concede perícias, um feat de origem e o ajuste de atributos.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BACKGROUNDS.map((b) => (
          <SelectableCard
            key={b.id}
            title={b.name}
            description={b.description}
            selected={draft.backgroundId === b.id}
            onClick={() => selectBackground(b.id)}
          />
        ))}
      </div>

      {background && (
        <div className="mt-5 bg-stone-100 rounded-lg p-4 text-sm text-stone-700 space-y-3">
          <div>
            <strong>Perícias:</strong> {background.skillProficiencies.map((s) => SKILL_INFO[s].label).join(', ')}
          </div>
          <div>
            <strong>Ferramenta:</strong> {background.toolProficiency}
          </div>
          {feat && (
            <div>
              <strong>Feat de Origem:</strong> {feat.name} — {feat.description}
            </div>
          )}

          <div>
            <div className="font-semibold text-stone-900 mb-2">Ajuste de Atributos</div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('twoOne')}
                className={`px-3 py-1.5 rounded text-xs font-medium ${mode === 'twoOne' ? 'bg-amber-700 text-white' : 'bg-white border border-stone-300'}`}
              >
                +2 / +1
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('oneOneOne');
                  applyOneOneOne();
                }}
                className={`px-3 py-1.5 rounded text-xs font-medium ${mode === 'oneOneOne' ? 'bg-amber-700 text-white' : 'bg-white border border-stone-300'}`}
              >
                +1 / +1 / +1
              </button>
            </div>

            {mode === 'twoOne' ? (
              <div className="flex flex-wrap gap-3 items-center">
                <label className="text-xs">
                  +2 em:{' '}
                  <select
                    className="border border-stone-300 rounded px-2 py-1 ml-1"
                    value={highAbility}
                    onChange={(e) => {
                      const val = e.target.value as AbilityKey;
                      setHighAbility(val);
                      applyTwoOne(val, lowAbility);
                    }}
                  >
                    <option value="">Escolha</option>
                    {background.abilityBonusChoice.abilities.map((a) => (
                      <option key={a} value={a}>
                        {ABILITY_LABELS[a]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  +1 em:{' '}
                  <select
                    className="border border-stone-300 rounded px-2 py-1 ml-1"
                    value={lowAbility}
                    onChange={(e) => {
                      const val = e.target.value as AbilityKey;
                      setLowAbility(val);
                      applyTwoOne(highAbility, val);
                    }}
                  >
                    <option value="">Escolha</option>
                    {background.abilityBonusChoice.abilities
                      .filter((a) => a !== highAbility)
                      .map((a) => (
                        <option key={a} value={a}>
                          {ABILITY_LABELS[a]}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="text-xs text-stone-600">
                +1 em {background.abilityBonusChoice.abilities.map((a) => ABILITY_LABELS[a]).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function canProceedBackground(draft: { backgroundId: string; backgroundAbilityBonuses: Partial<Record<AbilityKey, number>> }): boolean {
  if (!draft.backgroundId) return false;
  const total = Object.values(draft.backgroundAbilityBonuses).reduce((sum, v) => sum + (v ?? 0), 0);
  return total === 3;
}
