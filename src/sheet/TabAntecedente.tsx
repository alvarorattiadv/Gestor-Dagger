import type { Character } from '../types/character';
import type { DerivedSheet } from './deriveSheet';
import { getFeat } from '../data/feats';
import { formatProficiencyList } from '../data/proficiencyLabels';

export function TabAntecedente({ character, sheet }: { character: Character; sheet: DerivedSheet }) {
  const lineage = sheet.species.lineages?.find((l) => l.id === character.lineageId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-stone-800 mb-2">Proficiências</h3>
        <div className="bg-white border border-stone-200 rounded-lg p-3 text-sm text-stone-700 space-y-1 mb-5">
          <div>
            <strong>Armaduras:</strong> {formatProficiencyList(sheet.classDef.armorProficiencies)}
          </div>
          <div>
            <strong>Armas:</strong> {formatProficiencyList(sheet.classDef.weaponProficiencies)}
          </div>
          <div>
            <strong>Ferramentas:</strong> {formatProficiencyList(character.toolProficiencies)}
          </div>
          <div>
            <strong>Idiomas:</strong> {character.languages.join(', ') || 'Nenhum'}
          </div>
        </div>

        <h3 className="font-semibold text-stone-800 mb-2">{sheet.species.name}{lineage && ` — ${lineage.name}`}</h3>
        <ul className="text-sm text-stone-700 space-y-1.5 mb-5">
          {sheet.species.traits.map((t) => (
            <li key={t.name} className="bg-white border border-stone-200 rounded-lg p-2.5">
              <strong>{t.name}:</strong> {t.description}
            </li>
          ))}
          {lineage?.grantedTraits.map((t) => (
            <li key={t.name} className="bg-white border border-stone-200 rounded-lg p-2.5">
              <strong>{t.name}:</strong> {t.description}
            </li>
          ))}
        </ul>

        <h3 className="font-semibold text-stone-800 mb-2">{sheet.background.name}</h3>
        <p className="text-sm text-stone-600 mb-2">{sheet.background.description}</p>
        <div className="text-sm text-stone-700">Ferramenta: {sheet.background.toolProficiency}</div>

        <h3 className="font-semibold text-stone-800 mb-2 mt-5">Feats</h3>
        <ul className="text-sm text-stone-700 space-y-1.5">
          {character.featIds.map((id) => {
            const feat = getFeat(id);
            if (!feat) return null;
            return (
              <li key={id} className="bg-white border border-stone-200 rounded-lg p-2.5">
                <strong>{feat.name}:</strong> {feat.description}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-stone-800 mb-2">Características de {sheet.classDef.name}</h3>
        <ul className="text-sm text-stone-700 space-y-1.5 mb-5">
          {sheet.activeFeatures.map((f) => (
            <li key={f.id} className="bg-white border border-stone-200 rounded-lg p-2.5">
              <strong>{f.name}</strong> <span className="text-xs text-stone-400">(nível {f.level})</span>
              <div>{f.description}</div>
              {f.choice && character.classChoiceSelections[f.choice.id] && (
                <div className="text-xs text-amber-800 mt-1">
                  Escolha: {character.classChoiceSelections[f.choice.id].map((optId) => f.choice!.options.find((o) => o.id === optId)?.label ?? optId).join(', ')}
                </div>
              )}
            </li>
          ))}
        </ul>

        {sheet.subclass && (
          <>
            <h3 className="font-semibold text-stone-800 mb-2">{sheet.subclass.name}</h3>
            <ul className="text-sm text-stone-700 space-y-1.5">
              {sheet.activeSubclassFeatures.map((f) => (
                <li key={f.id} className="bg-white border border-stone-200 rounded-lg p-2.5">
                  <strong>{f.name}</strong> <span className="text-xs text-stone-400">(nível {f.level})</span>
                  <div>{f.description}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
