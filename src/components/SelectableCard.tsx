import type { ReactNode } from 'react';

interface SelectableCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  children?: ReactNode;
}

export function SelectableCard({ title, description, selected, onClick, children }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full rounded-lg border-2 p-4 transition-colors ${
        selected ? 'border-amber-700 bg-amber-50' : 'border-stone-300 bg-white hover:border-amber-400'
      }`}
    >
      <div className="font-semibold text-stone-900">{title}</div>
      {description && <div className="text-sm text-stone-600 mt-1">{description}</div>}
      {children}
    </button>
  );
}
