import { useRoleStore } from '../role';

interface PlayerNotesFieldProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function PlayerNotesField({ value, onChange, rows = 2, placeholder }: PlayerNotesFieldProps) {
  const isPlayer = useRoleStore((s) => s.role === 'player');
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-sky-700">Anotações dos jogadores</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!isPlayer}
        placeholder={placeholder ?? 'O que o grupo concluiu, suspeita ou anotou sobre isso'}
        rows={rows}
        className="w-full border border-sky-300 bg-sky-50 rounded-md px-2 py-1.5 text-sm disabled:bg-sky-50/60 disabled:text-stone-500 disabled:cursor-default"
      />
    </div>
  );
}

export const GENERAL_FIELD_DISABLED_CLASS =
  'disabled:bg-stone-50 disabled:text-stone-600 disabled:cursor-default disabled:border-stone-200';
