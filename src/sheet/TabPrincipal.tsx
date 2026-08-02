import type { DerivedSheet } from './deriveSheet';
import { ABILITY_KEYS, ABILITY_LABELS } from '../types/rules';
import { formatModifier } from '../engine/modifiers';

export function TabPrincipal({ sheet }: { sheet: DerivedSheet }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <h3 className="font-semibold text-stone-800 mb-2">Atributos</h3>
        <div className="grid grid-cols-2 gap-2">
          {ABILITY_KEYS.map((key) => (
            <div key={key} className="bg-white border border-stone-200 rounded-lg text-center py-3">
              <div className="text-xs text-stone-500">{ABILITY_LABELS[key]}</div>
              <div className="text-xl font-bold text-stone-900">{sheet.scores[key]}</div>
              <div className="text-sm text-stone-500">{formatModifier(sheet.mods[key])}</div>
            </div>
          ))}
        </div>

        <h3 className="font-semibold text-stone-800 mb-2 mt-5">Testes de Resistência</h3>
        <div className="space-y-1">
          {sheet.savingThrows.map((st) => (
            <div key={st.key} className="flex items-center justify-between bg-white border border-stone-200 rounded px-3 py-1.5 text-sm">
              <span className={st.proficient ? 'font-medium text-stone-900' : 'text-stone-600'}>
                {st.proficient && '● '}
                {ABILITY_LABELS[st.key]}
              </span>
              <span>{formatModifier(st.modifier)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <h3 className="font-semibold text-stone-800 mb-2">Perícias</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {sheet.skills.map((skill) => (
            <div key={skill.key} className="flex items-center justify-between bg-white border border-stone-200 rounded px-3 py-1.5 text-sm">
              <span className={skill.proficient ? 'font-medium text-stone-900' : 'text-stone-600'}>
                {skill.expertise ? '◆ ' : skill.proficient ? '● ' : ''}
                {skill.label}
                <span className="text-stone-400 text-xs"> ({ABILITY_LABELS[skill.ability].slice(0, 3)})</span>
              </span>
              <span>{formatModifier(skill.modifier)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
