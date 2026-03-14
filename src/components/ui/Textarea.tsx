'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-loam">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'block w-full rounded-2xl border-2 px-4 py-3 text-base resize-none',
            'bg-white/80 backdrop-blur-sm',
            'placeholder:text-stone-300',
            'transition-all duration-200',
            'focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400',
            error
              ? 'border-red-300 text-red-900 focus:ring-red-100 focus:border-red-400'
              : 'border-stone-200 text-loam hover:border-stone-300',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-sm text-weathered">{hint}</p>
        )}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
