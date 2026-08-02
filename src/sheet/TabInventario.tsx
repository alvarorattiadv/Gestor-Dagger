import { useState } from 'react';
import type { Character, Currency } from '../types/character';
import type { DerivedSheet } from './deriveSheet';
import { ITEMS, getItem } from '../data/items';

interface TabInventarioProps {
  character: Character;
  sheet: DerivedSheet;
  onToggleEquip: (itemId: string) => void;
  onChangeQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddItem: (itemId: string) => void;
  onChangeCurrency: (field: keyof Currency, value: number) => void;
}

export function TabInventario({ character, sheet, onToggleEquip, onChangeQuantity, onRemoveItem, onAddItem, onChangeCurrency }: TabInventarioProps) {
  const [addItemId, setAddItemId] = useState(ITEMS[0].id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <h3 className="font-semibold text-stone-800 mb-2">Inventário</h3>
        <div className="space-y-1.5">
          {character.inventory.map((entry) => {
            const item = getItem(entry.itemId);
            if (!item) return null;
            const equippable = Boolean(item.weapon || item.armor || item.category === 'escudo');
            return (
              <div key={entry.itemId} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  {equippable && (
                    <input type="checkbox" checked={entry.equipped} onChange={() => onToggleEquip(entry.itemId)} title="Equipado" />
                  )}
                  <span className="font-medium text-stone-900">{item.name}</span>
                  <span className="text-xs text-stone-400">{item.weight}kg cada</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    className="w-14 border border-stone-300 rounded px-1.5 py-0.5"
                    value={entry.quantity}
                    onChange={(e) => onChangeQuantity(entry.itemId, Math.max(0, Number(e.target.value)))}
                  />
                  <button onClick={() => onRemoveItem(entry.itemId)} className="text-red-600 text-xs hover:underline">
                    remover
                  </button>
                </div>
              </div>
            );
          })}
          {character.inventory.length === 0 && <p className="text-sm text-stone-500">Inventário vazio.</p>}
        </div>

        <div className="flex gap-2 mt-3">
          <select className="border border-stone-300 rounded px-2 py-1.5 text-sm flex-1" value={addItemId} onChange={(e) => setAddItemId(e.target.value)}>
            {ITEMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button onClick={() => onAddItem(addItemId)} className="px-3 py-1.5 rounded bg-stone-700 text-white text-sm">
            Adicionar
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-stone-800 mb-2">Moedas</h3>
        <div className="grid grid-cols-5 gap-1.5 mb-5">
          {(['pp', 'gp', 'ep', 'sp', 'cp'] as const).map((field) => (
            <label key={field} className="text-xs text-center">
              {field.toUpperCase()}
              <input
                type="number"
                className="w-full border border-stone-300 rounded px-1 py-1 mt-1"
                value={character.currency[field]}
                onChange={(e) => onChangeCurrency(field, Math.max(0, Number(e.target.value)))}
              />
            </label>
          ))}
        </div>

        <h3 className="font-semibold text-stone-800 mb-2">Capacidade de Carga</h3>
        <div className="bg-white border border-stone-200 rounded-lg p-3 text-sm text-stone-700">
          Máximo: <strong>{sheet.carrying}kg</strong>
        </div>
      </div>
    </div>
  );
}
