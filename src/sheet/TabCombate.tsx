import type { Character } from '../types/character';
import type { DerivedSheet } from './deriveSheet';
import type { ClassFeature } from '../types/classDef';
import { getItem } from '../data/items';
import { getSpell } from '../data/spells';
import { formatModifier } from '../engine/modifiers';

function weaponAbilityMod(properties: string[], mods: DerivedSheet['mods']): number {
  if (properties.includes('acuidade')) return Math.max(mods.str, mods.dex);
  if (properties.some((p) => p.startsWith('munição'))) return mods.dex;
  return mods.str;
}

interface ActionEntry {
  name: string;
  description: string;
}

function featureActionEntries(features: ClassFeature[], actionType: ClassFeature['actionType']): ActionEntry[] {
  return features.filter((f) => f.actionType === actionType).map((f) => ({ name: f.name, description: f.description }));
}

function spellActionEntries(spellIds: string[], castingTime: string): ActionEntry[] {
  return spellIds
    .map((id) => getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell) && spell!.castingTime === castingTime)
    .map((spell) => ({
      name: `${spell.name} (${spell.level === 0 ? 'Truque' : `Magia Nível ${spell.level}`})`,
      description: spell.description,
    }));
}

interface TabCombateProps {
  character: Character;
  sheet: DerivedSheet;
  onUseHitDie: () => void;
  onChangeFeatResourceUsed: (featId: string, used: number) => void;
  onResetFeatResource: (featId: string) => void;
}

export function TabCombate({ character, sheet, onUseHitDie, onChangeFeatResourceUsed, onResetFeatResource }: TabCombateProps) {
  const weapons = character.inventory
    .map((entry) => ({ entry, item: getItem(entry.itemId) }))
    .filter((x) => x.item?.weapon);

  const resourceFeats = sheet.feats.filter((f) => f.resourceGrant);

  const allFeatures = [...sheet.activeFeatures, ...sheet.activeSubclassFeatures];
  const spellIds = [...new Set([...character.knownSpellIds, ...character.preparedSpellIds, ...Object.values(character.featSpellSelections).flat()])];

  const unarmedAttackBonus = sheet.mods.str + sheet.profBonus;

  const weaponActionEntries: ActionEntry[] = weapons.map(({ item }) => {
    const w = item!.weapon!;
    const abilityMod = weaponAbilityMod(w.properties, sheet.mods);
    const attackBonus = abilityMod + sheet.profBonus;
    return {
      name: item!.name,
      description: `Ataque com arma: B.A. ${formatModifier(attackBonus)} para acertar. Dano: ${w.damageDice}${formatModifier(abilityMod)} ${w.damageType}.${w.properties.length ? ` (${w.properties.join(', ')})` : ''}`,
    };
  });

  const acao: ActionEntry[] = [
    {
      name: 'Ataque Desarmado',
      description: `B.A. ${formatModifier(unarmedAttackBonus)} para acertar. Dano: 1${formatModifier(sheet.mods.str)} Concussão.`,
    },
    ...weaponActionEntries,
    ...featureActionEntries(allFeatures, 'acao'),
    ...spellActionEntries(spellIds, '1 ação'),
  ];
  const acaoBonus: ActionEntry[] = [
    ...featureActionEntries(allFeatures, 'acao-bonus'),
    ...spellActionEntries(spellIds, '1 ação bônus'),
  ];
  const reacao: ActionEntry[] = [
    ...featureActionEntries(allFeatures, 'reacao'),
    ...spellActionEntries(spellIds, '1 reação'),
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-stone-800 mb-2">Classe de Armadura</h3>
          <div className="bg-white border border-stone-200 rounded-lg p-4 text-sm text-stone-700 space-y-1">
            <div className="text-2xl font-bold text-stone-900">{sheet.armorClass}</div>
            <div>Armadura: {sheet.equippedArmor ? 'Equipada' : 'Nenhuma (usa 10 + Destreza)'}</div>
            <div>Escudo: {sheet.hasShield ? 'Sim (+2)' : 'Não'}</div>
          </div>

          <h3 className="font-semibold text-stone-800 mb-2 mt-5">Dados de Vida</h3>
          <div className="bg-white border border-stone-200 rounded-lg p-4 text-sm text-stone-700 flex items-center justify-between">
            <span>
              {character.level - character.hitDiceUsed} / {character.level} d{sheet.classDef.hitDie} disponíveis
            </span>
            <button
              onClick={onUseHitDie}
              disabled={character.hitDiceUsed >= character.level}
              className="text-xs px-3 py-1.5 rounded bg-stone-700 text-white disabled:opacity-40"
            >
              Usar em descanso curto
            </button>
          </div>

          {resourceFeats.map((feat) => {
            const grant = feat.resourceGrant!;
            const used = Math.min(character.featResourcesUsed[feat.id] ?? 0, grant.count);
            return (
              <div key={feat.id} className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-stone-800">{grant.label}</h3>
                  <button onClick={() => onResetFeatResource(feat.id)} className="text-xs px-3 py-1.5 rounded bg-stone-700 text-white hover:bg-stone-800">
                    Descanso Longo
                  </button>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {Array.from({ length: grant.count }, (_, pipIndex) => {
                      const isUsed = pipIndex < used;
                      return (
                        <button
                          key={pipIndex}
                          type="button"
                          title={isUsed ? 'Marcado como gasto — clique para recuperar' : 'Clique para marcar como gasto'}
                          onClick={() => onChangeFeatResourceUsed(feat.id, isUsed ? pipIndex : pipIndex + 1)}
                          className={`w-6 h-6 rounded-full border-2 ${isUsed ? 'bg-amber-700 border-amber-700' : 'bg-white border-stone-400 hover:border-amber-500'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-stone-500 ml-auto">
                    {grant.count - used}/{grant.count} disponíveis
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="font-semibold text-stone-800 mb-2">Armas Portadas</h3>
          {weapons.length === 0 && <p className="text-sm text-stone-500">Nenhuma arma no inventário.</p>}
          <div className="space-y-2">
            {weapons.map(({ entry, item }) => {
              const w = item!.weapon!;
              const abilityMod = weaponAbilityMod(w.properties, sheet.mods);
              const attackBonus = abilityMod + sheet.profBonus;
              return (
                <div key={entry.itemId} className="bg-white border border-stone-200 rounded-lg p-3 text-sm flex items-center justify-between">
                  <div>
                    <div className="font-medium text-stone-900">{item!.name}</div>
                    <div className="text-xs text-stone-500">{w.properties.join(', ') || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div>B.A. {formatModifier(attackBonus)}</div>
                    <div className="text-xs text-stone-500">
                      {w.damageDice}
                      {formatModifier(abilityMod)} {w.damageType}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <ActionBlock title="Ação" entries={acao} />
        <ActionBlock title="Ação Bônus" entries={acaoBonus} />
        <ActionBlock title="Reação" entries={reacao} />
      </div>
    </div>
  );
}

function ActionBlock({ title, entries }: { title: string; entries: ActionEntry[] }) {
  return (
    <div>
      <h3 className="font-semibold text-stone-800 mb-2">{title}</h3>
      {entries.length === 0 && <p className="text-sm text-stone-500">Nada disponível.</p>}
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="bg-white border border-stone-200 rounded-lg p-3 text-sm">
            <span className="font-semibold text-stone-900">{entry.name}.</span>{' '}
            <span className="text-stone-700">{entry.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
