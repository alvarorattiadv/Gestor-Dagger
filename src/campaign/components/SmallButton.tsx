import type { ButtonHTMLAttributes } from 'react';

type Variant = 'solid' | 'secondary' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  solid: 'bg-violet-700 text-white hover:bg-violet-800',
  secondary: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};

interface SmallButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function SmallButton({ variant = 'solid', className = '', ...props }: SmallButtonProps) {
  return (
    <button
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
