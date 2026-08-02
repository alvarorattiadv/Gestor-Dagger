import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SmallButton } from './SmallButton';

export function NewCityForm({ onCreate }: { onCreate: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-medium text-violet-700 hover:underline">
        + Nova cidade
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nome da cidade"
        className="border border-violet-400 rounded-md px-2 py-1.5 text-sm"
      />
      <SmallButton onClick={submit}>Criar</SmallButton>
      <button
        onClick={() => {
          setOpen(false);
          setName('');
        }}
        className="text-xs text-stone-500 hover:underline"
      >
        Cancelar
      </button>
    </div>
  );
}
