'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'warm' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-500 text-white shadow-sm',
    'hover:bg-brand-600 hover:shadow-soft hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-sm',
    'focus-visible:ring-brand-400',
  ].join(' '),
  secondary: [
    'bg-brand-50 text-brand-600 border border-brand-100',
    'hover:bg-brand-100 hover:border-brand-200',
    'focus-visible:ring-brand-400',
  ].join(' '),
  outline: [
    'border-2 border-brand-500 bg-white/80 backdrop-blur-sm text-brand-600',
    'hover:bg-brand-50 hover:border-brand-600 hover:-translate-y-0.5',
    'active:translate-y-0',
    'focus-visible:ring-brand-400',
  ].join(' '),
  ghost: [
    'text-weathered',
    'hover:text-loam hover:bg-stone-100',
    'focus-visible:ring-stone-300',
  ].join(' '),
  warm: [
    'bg-accent-400 text-white shadow-sm',
    'hover:bg-accent-500 hover:shadow-soft hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-sm',
    'focus-visible:ring-accent-300',
  ].join(' '),
  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'focus-visible:ring-red-500',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-2xl gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
