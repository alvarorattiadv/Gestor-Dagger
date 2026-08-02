import { useState } from 'react';
import type { Character } from '../types/character';
import type { DerivedSheet } from './deriveSheet';
import { formatModifier } from '../engine/modifiers';

interface SheetHeaderProps {
  character: Character;
  sheet: DerivedSheet;
  onChangeHp: (field: 'hpCurrent' | 'hpTemp', value: number) => void;
  onApplyDamage: (amount: number) => void;
  onApplyHeal: (amount: number) => void;
  onLevelUp: () => void;
}

export function SheetHeader({ character, sheet, onChangeHp, onApplyDamage, onApplyHeal, onLevelUp }: SheetHeaderProps) {
  const [amount, setAmount] = useState(1);
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{character.name}</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {sheet.species.name} {sheet.subclass ? `· ${sheet.subclass.name} ` : ''}
            {sheet.classDef.name} · Nível {character.level} · {sheet.background.name}
          </p>
          {character.playerName && <p className="text-xs text-stone-400 mt-0.5">Jogador(a): {character.playerName} {character.alignment && `· ${character.alignment}`}</p>}
        </div>
        {character.level < 20 && (
          <button onClick={onLevelUp} className="px-4 py-2 rounded-md bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800">
            Subir de Nível
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-5">
        <Stat label="CA" value={sheet.armorClass} />
        <Stat label="Iniciativa" value={`${formatModifier(sheet.initiative)}${sheet.initiativeProficient ? ' ●' : ''}`} />
        <Stat label="Deslocamento" value={`${sheet.species.speed}m`} />
        <Stat label="Bônus Prof." value={formatModifier(sheet.profBonus)} />
        <Stat label="Perc. Passiva" value={sheet.passivePerception} />
        <Stat label="Dado de Vida" value={`${character.level}d${sheet.classDef.hitDie}`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 bg-stone-50 rounded-lg p-3">
        <div className="text-sm">
          <span className="text-stone-500">PV Máximo: </span>
          <strong>{sheet.hpMax}</strong>
          {sheet.hpBonus > 0 && <span className="text-stone-400"> (+{sheet.hpBonus} de talentos/traços)</span>}
        </div>
        <label className="text-sm flex items-center gap-1.5">
          PV Atual:
          <input
            type="number"
            className="w-16 border border-stone-300 rounded px-2 py-1"
            value={character.hpCurrent}
            onChange={(e) => onChangeHp('hpCurrent', Number(e.target.value))}
          />
        </label>
        <label className="text-sm flex items-center gap-1.5">
          PV Temporário:
          <input
            type="number"
            className="w-16 border border-stone-300 rounded px-2 py-1"
            value={character.hpTemp}
            onChange={(e) => onChangeHp('hpTemp', Number(e.target.value))}
          />
        </label>

        <div className="flex items-center gap-1.5 ml-auto">
          <input
            type="number"
            min={0}
            className="w-16 border border-stone-300 rounded px-2 py-1 text-sm"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          />
          <button
            onClick={() => onApplyDamage(amount)}
            className="px-3 py-1.5 rounded-md bg-red-700 text-white text-xs font-medium hover:bg-red-800"
          >
            Dano
          </button>
          <button
            onClick={() => onApplyHeal(amount)}
            className="px-3 py-1.5 rounded-md bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800"
          >
            Curar
          </button>
        </div>
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
