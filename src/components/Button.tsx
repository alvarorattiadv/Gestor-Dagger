import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-amber-700 text-white hover:bg-amber-800 disabled:bg-amber-700/40',
  secondary: 'bg-white text-amber-900 border border-amber-700 hover:bg-amber-50 disabled:opacity-40',
  danger: 'bg-red-700 text-white hover:bg-red-800 disabled:bg-red-700/40',
  ghost: 'bg-transparent text-amber-900 hover:bg-amber-100 disabled:opacity-40',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
