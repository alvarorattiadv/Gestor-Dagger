import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useCharacterStore } from '../store/characterStore';
import { deriveSheet } from '../sheet/deriveSheet';
import { SheetHeader } from '../sheet/SheetHeader';
import { TabPrincipal } from '../sheet/TabPrincipal';
import { TabCombate } from '../sheet/TabCombate';
import { TabMagias } from '../sheet/TabMagias';
import { TabInventario } from '../sheet/TabInventario';
import { TabAntecedente } from '../sheet/TabAntecedente';
import { LevelUpModal } from '../sheet/LevelUpModal';
import { Button } from '../components/Button';
import { downloadCharacterJson } from '../export/json';
import { CharacterPdfDocument } from '../export/CharacterPdfDocument';
import { applyDamage, applyHeal } from '../engine/combat';
import type { Currency } from '../types/character';

const TABS = ['Principal', 'Combate', 'Magias', 'Inventário', 'Antecedente'] as const;
type Tab = (typeof TABS)[number];

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const character = useCharacterStore((s) => s.characters.find((c) => c.id === id));
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const [tab, setTab] = useState<Tab>('Principal');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  if (!character) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-stone-600 mb-4">Personagem não encontrado.</p>
        <Link to="/" className="text-amber-800 hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  let sheet;
  try {
    sheet = deriveSheet(character);
  } catch {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-stone-600 mb-4">Não foi possível carregar os dados de regras deste personagem.</p>
        <Link to="/" className="text-amber-800 hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  function update(patch: Parameters<typeof updateCharacter>[1]) {
    updateCharacter(character!.id, (c) => ({ ...patch(c), updatedAt: new Date().toISOString() }));
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      const blob = await pdf(<CharacterPdfDocument character={character!} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${character!.name || 'personagem'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] pb-16">
      <header className="border-b border-stone-300 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-sm text-amber-800 hover:underline">
            ← Personagens
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => downloadCharacterJson(character)}>
              Exportar JSON
            </Button>
            <Button variant="secondary" onClick={handleExportPdf} disabled={exportingPdf}>
              {exportingPdf ? 'Gerando PDF…' : 'Exportar PDF'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <SheetHeader
          character={character}
          sheet={sheet}
          onLevelUp={() => setShowLevelUp(true)}
          onChangeHp={(field, value) => update((c) => ({ ...c, [field]: value }))}
          onApplyDamage={(amount) =>
            update((c) => {
              const { hpCurrent, hpTemp } = applyDamage({ hpCurrent: c.hpCurrent, hpTemp: c.hpTemp }, amount);
              return { ...c, hpCurrent, hpTemp };
            })
          }
          onApplyHeal={(amount) => update((c) => ({ ...c, hpCurrent: applyHeal(c.hpCurrent, sheet.hpMax, amount) }))}
        />

        <div className="flex gap-1 mb-4 border-b border-stone-300 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
                tab === t ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="bg-transparent">
          {tab === 'Principal' && <TabPrincipal sheet={sheet} />}
          {tab === 'Combate' && (
            <TabCombate
              character={character}
              sheet={sheet}
              onUseHitDie={() => update((c) => ({ ...c, hitDiceUsed: Math.min(c.level, c.hitDiceUsed + 1) }))}
              onChangeFeatResourceUsed={(featId, used) =>
                update((c) => ({ ...c, featResourcesUsed: { ...c.featResourcesUsed, [featId]: Math.max(0, used) } }))
              }
              onResetFeatResource={(featId) => update((c) => ({ ...c, featResourcesUsed: { ...c.featResourcesUsed, [featId]: 0 } }))}
            />
          )}
          {tab === 'Magias' && (
            <TabMagias
              character={character}
              sheet={sheet}
              onToggleCantrip={(spellId) =>
                update((c) => {
                  const has = c.knownSpellIds.includes(spellId);
                  return { ...c, knownSpellIds: has ? c.knownSpellIds.filter((s) => s !== spellId) : [...c.knownSpellIds, spellId] };
                })
              }
              onTogglePrepared={(spellId) =>
                update((c) => {
                  const has = c.preparedSpellIds.includes(spellId);
                  const preparedSpellIds = has ? c.preparedSpellIds.filter((s) => s !== spellId) : [...c.preparedSpellIds, spellId];
                  const knownSpellIds = has ? c.knownSpellIds.filter((s) => s !== spellId) : [...new Set([...c.knownSpellIds, spellId])];
                  return { ...c, preparedSpellIds, knownSpellIds };
                })
              }
              onToggleFeatSpell={(featId, spellId) =>
                update((c) => {
                  const current = c.featSpellSelections[featId] ?? [];
                  const has = current.includes(spellId);
                  const nextForFeat = has ? current.filter((s) => s !== spellId) : [...current, spellId];
                  const knownSpellIds = has ? c.knownSpellIds.filter((s) => s !== spellId) : [...new Set([...c.knownSpellIds, spellId])];
                  return { ...c, featSpellSelections: { ...c.featSpellSelections, [featId]: nextForFeat }, knownSpellIds };
                })
              }
              onChangeSlotUsed={(level, used) =>
                update((c) => ({ ...c, spellSlotsUsed: { ...c.spellSlotsUsed, [level]: Math.max(0, used) } }))
              }
              onLongRest={() => update((c) => ({ ...c, spellSlotsUsed: {} }))}
            />
          )}
          {tab === 'Inventário' && (
            <TabInventario
              character={character}
              sheet={sheet}
              onToggleEquip={(itemId) =>
                update((c) => ({
                  ...c,
                  inventory: c.inventory.map((e) => (e.itemId === itemId ? { ...e, equipped: !e.equipped } : e)),
                }))
              }
              onChangeQuantity={(itemId, quantity) =>
                update((c) => ({ ...c, inventory: c.inventory.map((e) => (e.itemId === itemId ? { ...e, quantity } : e)) }))
              }
              onRemoveItem={(itemId) => update((c) => ({ ...c, inventory: c.inventory.filter((e) => e.itemId !== itemId) }))}
              onAddItem={(itemId) =>
                update((c) => {
                  const existing = c.inventory.find((e) => e.itemId === itemId);
                  if (existing) {
                    return { ...c, inventory: c.inventory.map((e) => (e.itemId === itemId ? { ...e, quantity: e.quantity + 1 } : e)) };
                  }
                  return { ...c, inventory: [...c.inventory, { itemId, quantity: 1, equipped: false }] };
                })
              }
              onChangeCurrency={(field: keyof Currency, value: number) => update((c) => ({ ...c, currency: { ...c.currency, [field]: value } }))}
            />
          )}
          {tab === 'Antecedente' && <TabAntecedente character={character} sheet={sheet} />}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-stone-800 mb-2">Anotações</h3>
          <textarea
            className="w-full border border-stone-300 rounded-lg p-3 text-sm min-h-[100px] bg-white"
            value={character.notes}
            onChange={(e) => update((c) => ({ ...c, notes: e.target.value }))}
            placeholder="Anotações de campanha, aliados, tesouros…"
          />
        </div>
      </div>

      {showLevelUp && (
        <LevelUpModal
          character={character}
          onCancel={() => setShowLevelUp(false)}
          onConfirm={(updated) => {
            updateCharacter(character.id, () => updated);
            setShowLevelUp(false);
          }}
        />
      )}
    </div>
  );
}
