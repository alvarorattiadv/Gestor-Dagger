import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../store/wizardStore';
import { useCharacterStore } from '../../store/characterStore';
import { buildCharacter, finalAbilityScores } from '../buildCharacter';
import { getClass } from '../../data/classes';
import { getSpecies } from '../../data/species';
import { getBackground } from '../../data/backgrounds';
import { ABILITY_KEYS, ABILITY_LABELS } from '../../types/rules';
import { abilityModifier, formatModifier, hpAtLevelOne } from '../../engine';
import { Button } from '../../components/Button';

export function StepReview() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const addCharacter = useCharacterStore((s) => s.addCharacter);
  const navigate = useNavigate();

  const classDef = getClass(draft.classId);
  const species = getSpecies(draft.speciesId);
  const background = getBackground(draft.backgroundId);
  const scores = finalAbilityScores(draft);

  function handleCreate() {
    const character = buildCharacter(draft);
    addCharacter(character);
    resetDraft();
    navigate(`/personagem/${character.id}`);
  }

  if (!classDef || !species || !background) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Revisão</h2>
      <p className="text-sm text-stone-600 mb-4">Confira os detalhes e dê um nome ao seu personagem.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <label className="text-sm">
          Nome do Personagem
          <input
            className="mt-1 w-full border border-stone-300 rounded px-3 py-2"
            value={draft.name}
            onChange={(e) => setDraft({ name: e.target.value })}
            placeholder="Ex: Elowen Cordanata"
          />
        </label>
        <label className="text-sm">
          Nome do Jogador
          <input
            className="mt-1 w-full border border-stone-300 rounded px-3 py-2"
            value={draft.playerName}
            onChange={(e) => setDraft({ playerName: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Alinhamento
          <input
            className="mt-1 w-full border border-stone-300 rounded px-3 py-2"
            value={draft.alignment}
            onChange={(e) => setDraft({ alignment: e.target.value })}
            placeholder="Ex: Neutro e Bom"
          />
        </label>
      </div>

      <div className="bg-stone-100 rounded-lg p-4 space-y-2 text-sm text-stone-700">
        <div>
          <strong>{species.name}</strong> {draft.lineageId && `(${species.lineages?.find((l) => l.id === draft.lineageId)?.name})`} — <strong>{classDef.name}</strong> — Antecedente: <strong>{background.name}</strong>
        </div>
        <div>PV inicial: <strong>{hpAtLevelOne(classDef.hitDie, abilityModifier(scores.con))}</strong> (d{classDef.hitDie} + mod. Constituição)</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
          {ABILITY_KEYS.map((key) => (
            <div key={key} className="bg-white rounded border border-stone-300 text-center py-2">
              <div className="text-xs text-stone-500">{ABILITY_LABELS[key]}</div>
              <div className="font-bold text-lg">{scores[key]}</div>
              <div className="text-xs text-stone-500">{formatModifier(abilityModifier(scores[key]))}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleCreate} disabled={!draft.name.trim()}>
          Criar Personagem
        </Button>
      </div>
    </div>
  );
}
