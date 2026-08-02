import { getClass } from '../../data/classes';
import { getBackground } from '../../data/backgrounds';
import { spellsForLists, getSpell } from '../../data/spells';
import { classSpellGrantSource, featSpellGrantSources, type SpellGrantSource } from '../../data/spellGrants';
import { useWizardStore } from '../../store/wizardStore';
import { finalAbilityScores } from '../buildCharacter';
import { abilityModifier } from '../../engine/modifiers';
import type { WizardDraft } from '../types';
import type { Spell } from '../../types/spell';

function spellGrantSources(draft: WizardDraft): SpellGrantSource[] {
  const classDef = getClass(draft.classId);
  const background = getBackground(draft.backgroundId);
  const scores = finalAbilityScores(draft);
  const sources: SpellGrantSource[] = [];
  const classSource = classDef ? classSpellGrantSource(classDef, 1, abilityModifier(scores[classDef.spellcasting?.ability ?? 'int'])) : null;
  if (classSource) sources.push(classSource);
  if (background) sources.push(...featSpellGrantSources([background.featId]));
  return sources;
}

export function StepSpells() {
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);

  const sources = spellGrantSources(draft);
  if (sources.length === 0) return null;

  function toggleSpell(source: SpellGrantSource, spell: Spell) {
    const current = draft.spellSelections[source.key] ?? [];
    const has = current.includes(spell.id);
    if (has) {
      setDraft({ spellSelections: { ...draft.spellSelections, [source.key]: current.filter((id) => id !== spell.id) } });
      return;
    }
    const selected = current.map((id) => getSpell(id)).filter((s): s is Spell => Boolean(s));
    const cantripCount = selected.filter((s) => s.level === 0).length;
    const leveledCount = selected.filter((s) => s.level > 0).length;
    if (spell.level === 0 && cantripCount >= source.cantripsCount) return;
    if (spell.level > 0 && leveledCount >= source.spellsCount) return;
    setDraft({ spellSelections: { ...draft.spellSelections, [source.key]: [...current, spell.id] } });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Magias Iniciais</h2>
      <p className="text-sm text-stone-600 mb-4">Escolha suas magias conhecidas. Cada fonte (classe, talentos) tem seu próprio limite.</p>

      <div className="space-y-8">
        {sources.map((source) => (
          <SpellSourcePanel key={source.key} source={source} selectedIds={draft.spellSelections[source.key] ?? []} onToggle={(spell) => toggleSpell(source, spell)} />
        ))}
      </div>
    </div>
  );
}

function SpellSourcePanel({ source, selectedIds, onToggle }: { source: SpellGrantSource; selectedIds: string[]; onToggle: (spell: Spell) => void }) {
  const cantripPool = spellsForLists(source.spellListIds, 0);
  const leveledPool = spellsForLists(source.spellListIds, 1).filter((s) => s.level <= source.maxSpellLevel);
  const selectedCantrips = selectedIds.filter((id) => getSpell(id)?.level === 0);
  const selectedLeveled = selectedIds.filter((id) => (getSpell(id)?.level ?? 0) > 0);

  return (
    <div className="border border-stone-200 rounded-lg p-4">
      <h3 className="font-semibold text-stone-900 mb-3">{source.label}</h3>

      {source.cantripsCount > 0 && (
        <>
          <p className="text-sm text-stone-600 mb-2">
            Truques ({selectedCantrips.length}/{source.cantripsCount})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {cantripPool.map((spell) => (
              <SpellButton key={spell.id} spell={spell} selected={selectedIds.includes(spell.id)} disabled={!selectedIds.includes(spell.id) && selectedCantrips.length >= source.cantripsCount} onClick={() => onToggle(spell)} />
            ))}
          </div>
        </>
      )}

      {source.spellsCount > 0 && (
        <>
          <p className="text-sm text-stone-600 mb-2">
            Magias ({selectedLeveled.length}/{source.spellsCount})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {leveledPool.map((spell) => (
              <SpellButton key={spell.id} spell={spell} selected={selectedIds.includes(spell.id)} disabled={!selectedIds.includes(spell.id) && selectedLeveled.length >= source.spellsCount} onClick={() => onToggle(spell)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SpellButton({ spell, selected, disabled, onClick }: { spell: Spell; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-left text-sm px-3 py-2 rounded border ${
        selected ? 'bg-amber-700 text-white border-amber-700' : 'bg-white border-stone-300 hover:border-amber-400 disabled:opacity-40'
      }`}
    >
      <div className="font-medium">{spell.name}</div>
      <div className={`text-xs mt-0.5 ${selected ? 'text-amber-100' : 'text-stone-500'}`}>{spell.description}</div>
    </button>
  );
}

export function canProceedSpells(draft: WizardDraft): boolean {
  const sources = spellGrantSources(draft);
  return sources.every((source) => {
    const selected = (draft.spellSelections[source.key] ?? []).map((id) => getSpell(id)).filter((s): s is Spell => Boolean(s));
    const cantripCount = selected.filter((s) => s.level === 0).length;
    const leveledCount = selected.filter((s) => s.level > 0).length;
    return cantripCount === source.cantripsCount && leveledCount === source.spellsCount;
  });
}
