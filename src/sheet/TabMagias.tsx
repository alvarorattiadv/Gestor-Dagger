import type { Character } from '../types/character';
import type { DerivedSheet } from './deriveSheet';
import { spellsForClass, spellsForLists, getSpell } from '../data/spells';
import { featSpellGrantSources } from '../data/spellGrants';
import { formatModifier } from '../engine/modifiers';

interface TabMagiasProps {
  character: Character;
  sheet: DerivedSheet;
  onToggleCantrip: (id: string) => void;
  onTogglePrepared: (id: string) => void;
  onToggleFeatSpell: (featId: string, spellId: string) => void;
  onChangeSlotUsed: (level: number, used: number) => void;
  onLongRest: () => void;
}

export function TabMagias({ character, sheet, onToggleCantrip, onTogglePrepared, onToggleFeatSpell, onChangeSlotUsed, onLongRest }: TabMagiasProps) {
  const featSources = featSpellGrantSources(character.featIds);

  if (!sheet.spellcasting && featSources.length === 0) {
    return <p className="text-sm text-stone-500">Este personagem não tem acesso a magias.</p>;
  }

  return (
    <div>
      {sheet.spellcasting && (
        <ClassSpellcasting character={character} sheet={sheet} onToggleCantrip={onToggleCantrip} onTogglePrepared={onTogglePrepared} onChangeSlotUsed={onChangeSlotUsed} onLongRest={onLongRest} />
      )}

      {featSources.map((source) => {
        const selectedIds = character.featSpellSelections[source.key] ?? [];
        const cantripPool = spellsForLists(source.spellListIds, 0);
        const leveledPool = spellsForLists(source.spellListIds, 1).filter((s) => s.level <= source.maxSpellLevel);
        const selectedCantrips = selectedIds.filter((id) => getSpell(id)?.level === 0);
        const selectedLeveled = selectedIds.filter((id) => (getSpell(id)?.level ?? 0) > 0);
        return (
          <div key={source.key} className="mt-6 border border-stone-200 rounded-lg p-4">
            <h3 className="font-semibold text-stone-900 mb-3">{source.label}</h3>
            {source.cantripsCount > 0 && (
              <>
                <p className="text-sm text-stone-600 mb-2">
                  Truques ({selectedCantrips.length}/{source.cantripsCount})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {cantripPool.map((spell) => (
                    <SpellRow
                      key={spell.id}
                      name={spell.name}
                      description={spell.description}
                      selected={selectedIds.includes(spell.id)}
                      disabled={!selectedIds.includes(spell.id) && selectedCantrips.length >= source.cantripsCount}
                      onClick={() => onToggleFeatSpell(source.key, spell.id)}
                    />
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
                    <SpellRow
                      key={spell.id}
                      name={spell.name}
                      description={spell.description}
                      selected={selectedIds.includes(spell.id)}
                      disabled={!selectedIds.includes(spell.id) && selectedLeveled.length >= source.spellsCount}
                      onClick={() => onToggleFeatSpell(source.key, spell.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClassSpellcasting({
  character,
  sheet,
  onToggleCantrip,
  onTogglePrepared,
  onChangeSlotUsed,
  onLongRest,
}: Omit<TabMagiasProps, 'onToggleFeatSpell'>) {
  const spellcasting = sheet.spellcasting!;
  const cantripPool = spellsForClass(sheet.classDef.id, 0);
  const levelOnePool = spellsForClass(sheet.classDef.id, 1);
  const knownCantrips = character.knownSpellIds.filter((id) => getSpell(id)?.level === 0 && getSpell(id)?.classIds.includes(sheet.classDef.id));
  const preparedSpells = character.preparedSpellIds.filter((id) => getSpell(id)?.classIds.includes(sheet.classDef.id));

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="CD de Magia" value={spellcasting.saveDC} />
        <Stat label="Bônus de Ataque" value={formatModifier(spellcasting.attackBonus)} />
        <Stat label="Truques" value={`${knownCantrips.length}/${spellcasting.cantripsKnown}`} />
        <Stat label="Preparadas" value={`${preparedSpells.length}/${spellcasting.preparedCount}`} />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-stone-800">Espaços de Magia</h3>
        <button onClick={onLongRest} className="text-xs px-3 py-1.5 rounded bg-stone-700 text-white hover:bg-stone-800">
          Descanso Longo (recupera espaços)
        </button>
      </div>
      <div className="space-y-2 mb-5">
        {spellcasting.slots.map((total, index) => {
          const level = index + 1;
          if (total === 0) return null;
          const used = Math.min(character.spellSlotsUsed[level] ?? 0, total);
          return (
            <div key={level} className="flex items-center gap-3 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm">
              <span className="w-20 shrink-0">Nível {level}</span>
              <div className="flex gap-1.5">
                {Array.from({ length: total }, (_, pipIndex) => {
                  const isUsed = pipIndex < used;
                  return (
                    <button
                      key={pipIndex}
                      type="button"
                      title={isUsed ? 'Marcado como gasto — clique para recuperar' : 'Clique para marcar como gasto'}
                      onClick={() => onChangeSlotUsed(level, isUsed ? pipIndex : pipIndex + 1)}
                      className={`w-6 h-6 rounded-full border-2 ${isUsed ? 'bg-amber-700 border-amber-700' : 'bg-white border-stone-400 hover:border-amber-500'}`}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-stone-500 ml-auto">
                {total - used}/{total} disponíveis
              </span>
            </div>
          );
        })}
      </div>

      <h3 className="font-semibold text-stone-800 mb-2">Truques</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        {cantripPool.map((spell) => {
          const selected = knownCantrips.includes(spell.id);
          const disabled = !selected && knownCantrips.length >= spellcasting.cantripsKnown;
          return (
            <SpellRow key={spell.id} name={spell.name} description={spell.description} selected={selected} disabled={disabled} onClick={() => onToggleCantrip(spell.id)} />
          );
        })}
      </div>

      <h3 className="font-semibold text-stone-800 mb-2">Magias de 1º Nível</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {levelOnePool.map((spell) => {
          const selected = preparedSpells.includes(spell.id);
          const disabled = !selected && preparedSpells.length >= spellcasting.preparedCount;
          return (
            <SpellRow key={spell.id} name={spell.name} description={spell.description} selected={selected} disabled={disabled} onClick={() => onTogglePrepared(spell.id)} />
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-stone-50 rounded-lg text-center py-2">
      <div className="text-[11px] text-stone-500">{label}</div>
      <div className="text-lg font-bold text-stone-900">{value}</div>
    </div>
  );
}

function SpellRow({ name, description, selected, disabled, onClick }: { name: string; description: string; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-left text-sm px-3 py-2 rounded border ${
        selected ? 'bg-amber-700 text-white border-amber-700' : 'bg-white border-stone-300 hover:border-amber-400 disabled:opacity-40'
      }`}
    >
      <div className="font-medium">{name}</div>
      <div className={`text-xs mt-0.5 ${selected ? 'text-amber-100' : 'text-stone-500'}`}>{description}</div>
    </button>
  );
}
