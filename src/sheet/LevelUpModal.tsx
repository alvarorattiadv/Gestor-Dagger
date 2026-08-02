import { useState } from 'react';
import type { Character, LevelUpRecord } from '../types/character';
import type { AbilityKey, SkillKey } from '../types/rules';
import { ABILITY_KEYS, ABILITY_LABELS, SKILL_KEYS, SKILL_INFO } from '../types/rules';
import { getClass } from '../data/classes';
import { FEATS, getFeat } from '../data/feats';
import { spellsForLists, getSpell } from '../data/spells';
import type { Spell } from '../types/spell';
import { averageHpGain } from '../engine/combat';
import { abilityModifier } from '../engine/modifiers';
import { isAbilityScoreImprovementLevel, isSubclassLevel } from '../engine/leveling';
import { abilityScores } from './deriveSheet';
import { Button } from '../components/Button';

interface LevelUpModalProps {
  character: Character;
  onCancel: () => void;
  onConfirm: (updated: Character) => void;
}

export function LevelUpModal({ character, onCancel, onConfirm }: LevelUpModalProps) {
  const classDef = getClass(character.classId)!;
  const nextLevel = character.level + 1;
  const conMod = abilityModifier(abilityScores(character).con);

  const isAsiLevel = isAbilityScoreImprovementLevel(classDef, nextLevel);
  const needsSubclass = isSubclassLevel(classDef, nextLevel) && !character.subclassId && classDef.subclasses.length > 0;

  const [hpMode, setHpMode] = useState<'media' | 'rolar'>('media');
  const [hpRolled, setHpRolled] = useState(Math.ceil(classDef.hitDie / 2));
  const [asiMode, setAsiMode] = useState<'ability' | 'feat'>('ability');
  const [abilityChoice, setAbilityChoice] = useState<'single' | 'double'>('double');
  const [abilityA, setAbilityA] = useState<AbilityKey>(classDef.primaryAbilities[0] ?? 'str');
  const [abilityB, setAbilityB] = useState<AbilityKey>('con');
  const [featId, setFeatId] = useState(FEATS.find((f) => !character.featIds.includes(f.id))?.id ?? FEATS[0].id);
  const [subclassId, setSubclassId] = useState(classDef.subclasses[0]?.id ?? '');
  const [featSpellChoice, setFeatSpellChoice] = useState<string[]>([]);
  const [featSkillChoice, setFeatSkillChoice] = useState<SkillKey[]>([]);

  const hpGain = hpMode === 'media' ? averageHpGain(classDef.hitDie) + conMod : hpRolled + conMod;

  const chosenFeat = asiMode === 'feat' ? getFeat(featId) : undefined;
  const spellGrant = chosenFeat?.spellGrant;
  const skillGrant = chosenFeat?.skillGrant;

  function selectFeat(id: string) {
    setFeatId(id);
    setFeatSpellChoice([]);
    setFeatSkillChoice([]);
  }

  function toggleFeatSkill(skill: SkillKey) {
    if (!skillGrant) return;
    const has = featSkillChoice.includes(skill);
    if (has) {
      setFeatSkillChoice(featSkillChoice.filter((s) => s !== skill));
    } else if (featSkillChoice.length < skillGrant.count) {
      setFeatSkillChoice([...featSkillChoice, skill]);
    }
  }

  function toggleFeatSpell(spell: Spell) {
    if (!spellGrant) return;
    const has = featSpellChoice.includes(spell.id);
    if (has) {
      setFeatSpellChoice(featSpellChoice.filter((id) => id !== spell.id));
      return;
    }
    const selected = featSpellChoice.map((id) => getSpell(id)).filter((s): s is Spell => Boolean(s));
    const cantripCount = selected.filter((s) => s.level === 0).length;
    const leveledCount = selected.filter((s) => s.level > 0).length;
    if (spell.level === 0 && cantripCount >= spellGrant.cantripsCount) return;
    if (spell.level > 0 && leveledCount >= spellGrant.spellsCount) return;
    setFeatSpellChoice([...featSpellChoice, spell.id]);
  }

  const featSpellSelectionComplete = (() => {
    if (!spellGrant) return true;
    const selected = featSpellChoice.map((id) => getSpell(id)).filter((s): s is Spell => Boolean(s));
    return selected.filter((s) => s.level === 0).length === spellGrant.cantripsCount && selected.filter((s) => s.level > 0).length === spellGrant.spellsCount;
  })();

  const featSkillSelectionComplete = !skillGrant || featSkillChoice.length === skillGrant.count;

  const canConfirm = !isAsiLevel || asiMode === 'ability' || (featSpellSelectionComplete && featSkillSelectionComplete);

  function handleConfirm() {
    const record: LevelUpRecord = { level: nextLevel, hpRolled: Math.max(1, hpGain) };
    const updated: Character = {
      ...character,
      level: nextLevel,
      hpMax: character.hpMax + Math.max(1, hpGain),
      hpCurrent: character.hpCurrent + Math.max(1, hpGain),
      updatedAt: new Date().toISOString(),
    };

    if (isAsiLevel) {
      if (asiMode === 'ability') {
        const increases: Partial<Record<AbilityKey, number>> = {};
        if (abilityChoice === 'double') {
          increases[abilityA] = (increases[abilityA] ?? 0) + 1;
          increases[abilityB] = (increases[abilityB] ?? 0) + 1;
        } else {
          increases[abilityA] = (increases[abilityA] ?? 0) + 2;
        }
        updated.baseAbilityScores = { ...updated.baseAbilityScores };
        for (const [key, value] of Object.entries(increases)) {
          const k = key as AbilityKey;
          updated.baseAbilityScores[k] = Math.min(20, updated.baseAbilityScores[k] + (value ?? 0));
        }
        record.abilityScoreImprovement = { type: 'ability', abilityIncreases: increases };
      } else {
        updated.featIds = [...updated.featIds, featId];
        record.abilityScoreImprovement = { type: 'feat', featId };
        if (spellGrant) {
          updated.featSpellSelections = { ...updated.featSpellSelections, [featId]: featSpellChoice };
          updated.knownSpellIds = [...new Set([...updated.knownSpellIds, ...featSpellChoice])];
        }
        if (skillGrant) {
          updated.skillProficiencies = [...new Set([...updated.skillProficiencies, ...featSkillChoice])];
        }
      }
    }

    if (needsSubclass) {
      updated.subclassId = subclassId;
      record.subclassId = subclassId;
    }

    updated.levelHistory = [...updated.levelHistory, record];
    onConfirm(updated);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-stone-900 mb-4">
          Subir para o Nível {nextLevel}
        </h2>

        <div className="mb-5">
          <div className="font-semibold text-sm text-stone-800 mb-2">Pontos de Vida</div>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setHpMode('media')}
              className={`px-3 py-1.5 rounded text-xs font-medium ${hpMode === 'media' ? 'bg-amber-700 text-white' : 'bg-white border border-stone-300'}`}
            >
              Usar Média ({averageHpGain(classDef.hitDie)})
            </button>
            <button
              type="button"
              onClick={() => setHpMode('rolar')}
              className={`px-3 py-1.5 rounded text-xs font-medium ${hpMode === 'rolar' ? 'bg-amber-700 text-white' : 'bg-white border border-stone-300'}`}
            >
              Inserir Rolagem
            </button>
          </div>
          {hpMode === 'rolar' && (
            <input
              type="number"
              min={1}
              max={classDef.hitDie}
              value={hpRolled}
              onChange={(e) => setHpRolled(Math.max(1, Math.min(classDef.hitDie, Number(e.target.value))))}
              className="border border-stone-300 rounded px-2 py-1 w-20"
            />
          )}
          <div className="text-xs text-stone-500 mt-1">
            Ganho total: {Math.max(1, hpGain)} (d{classDef.hitDie} + mod. Constituição {conMod >= 0 ? `+${conMod}` : conMod})
          </div>
        </div>

        {isAsiLevel && (
          <div className="mb-5">
            <div className="font-semibold text-sm text-stone-800 mb-2">Melhoria (nível {nextLevel})</div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAsiMode('ability')}
                className={`px-3 py-1.5 rounded text-xs font-medium ${asiMode === 'ability' ? 'bg-amber-700 text-white' : 'bg-white border border-stone-300'}`}
              >
                Melhorar Atributos
              </button>
              <button
                type="button"
                onClick={() => setAsiMode('feat')}
                className={`px-3 py-1.5 rounded text-xs font-medium ${asiMode === 'feat' ? 'bg-amber-700 text-white' : 'bg-white border border-stone-300'}`}
              >
                Escolher Feat
              </button>
            </div>

            {asiMode === 'ability' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAbilityChoice('double')}
                    className={`px-2 py-1 rounded text-xs ${abilityChoice === 'double' ? 'bg-stone-700 text-white' : 'bg-stone-100'}`}
                  >
                    +1 / +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbilityChoice('single')}
                    className={`px-2 py-1 rounded text-xs ${abilityChoice === 'single' ? 'bg-stone-700 text-white' : 'bg-stone-100'}`}
                  >
                    +2
                  </button>
                </div>
                <select className="border border-stone-300 rounded px-2 py-1" value={abilityA} onChange={(e) => setAbilityA(e.target.value as AbilityKey)}>
                  {ABILITY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {ABILITY_LABELS[k]}
                    </option>
                  ))}
                </select>
                {abilityChoice === 'double' && (
                  <select className="border border-stone-300 rounded px-2 py-1 ml-2" value={abilityB} onChange={(e) => setAbilityB(e.target.value as AbilityKey)}>
                    {ABILITY_KEYS.filter((k) => k !== abilityA).map((k) => (
                      <option key={k} value={k}>
                        {ABILITY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div>
                <select className="border border-stone-300 rounded px-2 py-1 w-full" value={featId} onChange={(e) => selectFeat(e.target.value)}>
                  {FEATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                {spellGrant && (
                  <FeatSpellPicker spellGrant={spellGrant} selectedIds={featSpellChoice} onToggle={toggleFeatSpell} />
                )}

                {skillGrant && (
                  <div className="mt-3 border border-stone-200 rounded-lg p-3">
                    <p className="text-xs text-stone-600 mb-1.5">
                      Perícias ({featSkillChoice.length}/{skillGrant.count})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {SKILL_KEYS.filter((skill) => !character.skillProficiencies.includes(skill)).map((skill) => {
                        const selected = featSkillChoice.includes(skill);
                        const disabled = !selected && featSkillChoice.length >= skillGrant.count;
                        return (
                          <button
                            key={skill}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleFeatSkill(skill)}
                            className={`text-left text-xs px-2 py-1.5 rounded border ${
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
              </div>
            )}
          </div>
        )}

        {needsSubclass && (
          <div className="mb-5">
            <div className="font-semibold text-sm text-stone-800 mb-2">Subclasse</div>
            <select className="border border-stone-300 rounded px-2 py-1 w-full" value={subclassId} onChange={(e) => setSubclassId(e.target.value)}>
              {classDef.subclasses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatSpellPicker({
  spellGrant,
  selectedIds,
  onToggle,
}: {
  spellGrant: NonNullable<ReturnType<typeof getFeat>>['spellGrant'];
  selectedIds: string[];
  onToggle: (spell: Spell) => void;
}) {
  if (!spellGrant) return null;
  const cantripPool = spellsForLists(spellGrant.spellListIds, 0);
  const leveledPool = spellsForLists(spellGrant.spellListIds, 1).filter((s) => s.level <= spellGrant.maxSpellLevel);
  const selectedCantrips = selectedIds.filter((id) => getSpell(id)?.level === 0);
  const selectedLeveled = selectedIds.filter((id) => (getSpell(id)?.level ?? 0) > 0);

  return (
    <div className="mt-3 border border-stone-200 rounded-lg p-3">
      {spellGrant.cantripsCount > 0 && (
        <>
          <p className="text-xs text-stone-600 mb-1.5">
            Truques ({selectedCantrips.length}/{spellGrant.cantripsCount})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
            {cantripPool.map((spell) => (
              <SpellChoiceButton key={spell.id} spell={spell} selected={selectedIds.includes(spell.id)} disabled={!selectedIds.includes(spell.id) && selectedCantrips.length >= spellGrant.cantripsCount} onClick={() => onToggle(spell)} />
            ))}
          </div>
        </>
      )}
      {spellGrant.spellsCount > 0 && (
        <>
          <p className="text-xs text-stone-600 mb-1.5">
            Magias ({selectedLeveled.length}/{spellGrant.spellsCount})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {leveledPool.map((spell) => (
              <SpellChoiceButton key={spell.id} spell={spell} selected={selectedIds.includes(spell.id)} disabled={!selectedIds.includes(spell.id) && selectedLeveled.length >= spellGrant.spellsCount} onClick={() => onToggle(spell)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SpellChoiceButton({ spell, selected, disabled, onClick }: { spell: Spell; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-left text-xs px-2 py-1.5 rounded border ${
        selected ? 'bg-amber-700 text-white border-amber-700' : 'bg-white border-stone-300 hover:border-amber-400 disabled:opacity-40'
      }`}
    >
      {spell.name}
    </button>
  );
}
