'use client';

import { cn } from '@/lib/utils';
import type { ReportSeverity } from '@/types/database';

interface SeverityPickerProps {
  value: ReportSeverity;
  onChange: (severity: ReportSeverity) => void;
}

const options: { value: ReportSeverity; label: string; desc: string }[] = [
  { value: 'low', label: 'Light', desc: 'A few items' },
  { value: 'medium', label: 'Moderate', desc: 'Noticeable build-up' },
  { value: 'bad', label: 'Heavy', desc: 'Seriously littered' },
];

export default function SeverityPicker({ value, onChange }: SeverityPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-400">How bad is it?</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all',
              value === opt.value
                ? 'border-brand-500 bg-brand-50 shadow-sm'
                : 'border-stone-100 bg-white hover:border-stone-200'
            )}
          >
            <div className={cn(
              'w-3 h-3 rounded-full',
              opt.value === 'low' ? 'bg-stone-300' : opt.value === 'medium' ? 'bg-accent-400' : 'bg-red-500'
            )} />
            <span className="text-sm font-semibold text-loam">{opt.label}</span>
            <span className="text-xs text-weathered">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
