'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { InterestType } from '@/types/database';

interface VolunteerInterestButtonProps {
  hotspotId: string;
}

const interestOptions: { type: InterestType; label: string }[] = [
  { type: 'help', label: 'I\u2019d help clear this' },
  { type: 'join', label: 'I\u2019d join a pick here' },
  { type: 'organise', label: 'I could organise this' },
];

export default function VolunteerInterestButton({ hotspotId }: VolunteerInterestButtonProps) {
  const [selectedType, setSelectedType] = useState<InterestType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const handleExpress = async (type: InterestType) => {
    setSubmitting(true);
    setSelectedType(type);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setNeedsAuth(true);
      setSubmitting(false);
      return;
    }

    const res = await fetch('/api/volunteers/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotspot_id: hotspotId, interest_type: type }),
    });

    setSubmitting(false);

    if (res.ok) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="bg-brand-50 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold text-brand-600">Noted. You&apos;re in.</p>
        <p className="text-xs text-brand-500 mt-1">
          We&apos;ll let you know when a pick forms here.
        </p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="bg-accent-50 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold text-accent-600 mb-3">
          Sign up to volunteer first
        </p>
        <a href="/volunteer">
          <Button size="sm">Sign up</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-loam">Interested in helping?</p>
      {interestOptions.map((opt) => (
        <button
          key={opt.type}
          onClick={() => handleExpress(opt.type)}
          disabled={submitting}
          className="w-full flex items-center gap-3 rounded-xl border border-stone-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50/50 transition-all disabled:opacity-50"
        >
          <span className="text-sm font-medium text-loam">{opt.label}</span>
          {submitting && selectedType === opt.type && (
            <svg className="ml-auto animate-spin h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
