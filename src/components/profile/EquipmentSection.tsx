'use client';

import { useState } from 'react';
import type { EquipmentStatus } from '@/types/database';

interface EquipmentData {
  equipment_bags: EquipmentStatus | null;
  equipment_bag_hoop: EquipmentStatus | null;
  equipment_gloves: EquipmentStatus | null;
  equipment_litter_picker: EquipmentStatus | null;
}

interface Props {
  equipment: EquipmentData;
  onChange: (updated: EquipmentData) => void;
}

const ITEMS: { key: keyof EquipmentData; label: string; icon: JSX.Element }[] = [
  {
    key: 'equipment_bags',
    label: 'Bags',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    key: 'equipment_bag_hoop',
    label: 'Bag hoop',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <circle cx="12" cy="12" r="8" />
        <path strokeLinecap="round" d="M12 4v2m0 12v2" />
      </svg>
    ),
  },
  {
    key: 'equipment_gloves',
    label: 'Gloves',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075-5.925v3m0-3a1.575 1.575 0 013.15 0v3m-3.15 0v3.375c0 .621.504 1.125 1.125 1.125h.75m-6.375-7.5v3.375c0 .621-.504 1.125-1.125 1.125h-.75M6.9 7.575V12m0 0v4.125c0 1.036.84 1.875 1.875 1.875h6.45c1.035 0 1.875-.84 1.875-1.875V12M6.9 12h10.2" />
      </svg>
    ),
  },
  {
    key: 'equipment_litter_picker',
    label: 'Litter picker',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75L6 6l1.5 2.25M16.5 3.75L18 6l-1.5 2.25M12 3v18m0 0l-3-2m3 2l3-2" />
      </svg>
    ),
  },
];

const STATUS_OPTIONS: { value: EquipmentStatus; label: string; short: string }[] = [
  { value: 'own', label: 'I have my own', short: 'Have' },
  { value: 'dont_need', label: "Don't need", short: "Don't need" },
  { value: 'borrow', label: 'Would like to borrow', short: 'Need' },
];

export default function EquipmentSection({ equipment, onChange }: Props) {
  const [saving, setSaving] = useState<string | null>(null);

  const handleChange = async (key: keyof EquipmentData, value: EquipmentStatus) => {
    // If tapping the same value, deselect it (set to null)
    const newValue = equipment[key] === value ? null : value;
    const prev = { ...equipment };
    const updated = { ...equipment, [key]: newValue };
    onChange(updated);
    setSaving(key);

    try {
      const res = await fetch('/api/auth/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      });
      if (!res.ok) {
        onChange(prev); // revert on failure
      }
    } catch {
      onChange(prev);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-3">
      {ITEMS.map(({ key, label, icon }) => {
        const status = equipment[key];
        return (
          <div key={key} className="flex items-center gap-3">
            {/* Icon + label */}
            <div className="flex items-center gap-2 w-28 shrink-0">
              <span className={`${status === 'own' ? 'text-brand-500' : status === 'borrow' ? 'text-red-400' : 'text-stone-300'}`}>
                {icon}
              </span>
              <span className="text-sm font-medium text-loam">{label}</span>
            </div>

            {/* Status toggle buttons */}
            <div className="flex gap-1 flex-1">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                let btnClass = 'px-2 py-1 text-xs font-medium rounded-lg transition-all ';
                if (active && opt.value === 'own') {
                  btnClass += 'bg-brand-50 text-brand-600 ring-1 ring-brand-200';
                } else if (active && opt.value === 'borrow') {
                  btnClass += 'bg-red-50 text-red-600 ring-1 ring-red-200';
                } else if (active && opt.value === 'dont_need') {
                  btnClass += 'bg-stone-100 text-stone-500 ring-1 ring-stone-200';
                } else {
                  btnClass += 'bg-stone-50 text-stone-400 hover:bg-stone-100';
                }

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleChange(key, opt.value)}
                    disabled={saving === key}
                    className={btnClass}
                  >
                    {opt.short}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Equipment icons for volunteer lists — shows labelled pills */
export function EquipmentIcons({ equipment, compact }: { equipment: Record<string, string | null | undefined>; compact?: boolean }) {
  const items: { key: string; label: string; icon: JSX.Element }[] = [
    {
      key: 'equipment_bags',
      label: 'Bags',
      icon: (
        <svg className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      key: 'equipment_bag_hoop',
      label: 'Hoop',
      icon: (
        <svg className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <circle cx="12" cy="12" r="8" />
          <path strokeLinecap="round" d="M12 4v2m0 12v2" />
        </svg>
      ),
    },
    {
      key: 'equipment_gloves',
      label: 'Gloves',
      icon: (
        <svg className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075-5.925v3m0-3a1.575 1.575 0 013.15 0v3m-3.15 0v3.375c0 .621.504 1.125 1.125 1.125h.75m-6.375-7.5v3.375c0 .621-.504 1.125-1.125 1.125h-.75M6.9 7.575V12m0 0v4.125c0 1.036.84 1.875 1.875 1.875h6.45c1.035 0 1.875-.84 1.875-1.875V12M6.9 12h10.2" />
        </svg>
      ),
    },
    {
      key: 'equipment_litter_picker',
      label: 'Picker',
      icon: (
        <svg className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75L6 6l1.5 2.25M16.5 3.75L18 6l-1.5 2.25M12 3v18m0 0l-3-2m3 2l3-2" />
        </svg>
      ),
    },
  ];

  // Only show items that have a status set (own or borrow)
  const relevant = items.filter(({ key }) => {
    const val = equipment[key];
    return val === 'own' || val === 'borrow';
  });

  if (relevant.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap justify-center gap-1">
        {relevant.map(({ key, icon }) => {
          const isOwn = equipment[key] === 'own';
          return (
            <span
              key={key}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                isOwn ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-500'
              }`}
            >
              {icon}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {relevant.map(({ key, label, icon }) => {
        const isOwn = equipment[key] === 'own';
        return (
          <span
            key={key}
            title={`${label}: ${isOwn ? 'Has own' : 'Needs to borrow'}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
              isOwn
                ? 'bg-brand-50 text-brand-600'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {icon}
            {label}
          </span>
        );
      })}
    </div>
  );
}

/** Aggregate equipment summary across all volunteers for a pick */
export function EquipmentSummary({ volunteers }: { volunteers: { first_name: string; equipment_bags: string | null; equipment_bag_hoop: string | null; equipment_gloves: string | null; equipment_litter_picker: string | null }[] }) {
  const items: { key: string; label: string }[] = [
    { key: 'equipment_bags', label: 'Bags' },
    { key: 'equipment_bag_hoop', label: 'Bag hoop' },
    { key: 'equipment_gloves', label: 'Gloves' },
    { key: 'equipment_litter_picker', label: 'Litter picker' },
  ];

  // Count how many people have each item and how many need to borrow
  const counts = items.map(({ key, label }) => {
    let have = 0;
    let need = 0;
    for (const v of volunteers) {
      const val = (v as Record<string, string | null>)[key];
      if (val === 'own') have++;
      if (val === 'borrow') need++;
    }
    return { key, label, have, need, total: have + need };
  });

  const hasAnyData = counts.some(c => c.have > 0 || c.need > 0);
  if (!hasAnyData) return null;

  return (
    <div className="space-y-2">
      {counts.map(({ key, label, have, need, total }) => {
        if (total === 0) return null;
        return (
          <div key={key} className="bg-stone-50 rounded-lg px-3 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-loam">{label}</span>
              <span className="text-xs text-stone-400">{total} volunteer{total !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-4">
              {have > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {have} confirmed
                </span>
              )}
              {need > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {need} requested
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
