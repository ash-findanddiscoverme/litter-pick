'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { getCouncilForCoordinates } from '@/lib/councils';
import type { Cleanup, Hotspot } from '@/types/database';

interface CouncilSectionProps {
  cleanup: Cleanup;
  hotspot: Hotspot;
  isOrganiser: boolean;
}

export default function CouncilSection({ cleanup, hotspot, isOrganiser }: CouncilSectionProps) {
  const [notified, setNotified] = useState(!!cleanup.council_notified);
  const [confirmed, setConfirmed] = useState(!!cleanup.council_collection_confirmed);
  const [saving, setSaving] = useState(false);

  const council = getCouncilForCoordinates(
    hotspot.centroid_latitude,
    hotspot.centroid_longitude
  );

  // If no council identified for this location, don't show the section
  if (!council) {
    return null;
  }

  const collectionOrganised = notified && confirmed;

  const handleToggle = async (
    field: 'council_notified' | 'council_collection_confirmed',
    value: boolean
  ) => {
    setSaving(true);

    // Optimistic update
    if (field === 'council_notified') setNotified(value);
    else setConfirmed(value);

    try {
      const res = await fetch(`/api/cleanups/${cleanup.id}/council`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        // Revert on failure
        if (field === 'council_notified') setNotified(!value);
        else setConfirmed(!value);
      }
    } catch {
      // Revert on error
      if (field === 'council_notified') setNotified(!value);
      else setConfirmed(!value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">
        Council collection
      </h3>

      {/* Council link */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-loam">{council.name} Council</p>
        <a
          href={council.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 text-sm font-medium rounded-lg hover:bg-brand-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Contact council
        </a>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2.5 mb-4">
        <label className={`flex items-start gap-3 ${!isOrganiser ? 'cursor-default' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={notified}
            onChange={(e) => isOrganiser && handleToggle('council_notified', e.target.checked)}
            disabled={!isOrganiser || saving}
            className="mt-0.5 w-4 h-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500 disabled:opacity-60"
          />
          <span className="text-sm text-loam">Council has been made aware of litter pick</span>
        </label>

        <label className={`flex items-start gap-3 ${!isOrganiser ? 'cursor-default' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => isOrganiser && handleToggle('council_collection_confirmed', e.target.checked)}
            disabled={!isOrganiser || saving}
            className="mt-0.5 w-4 h-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500 disabled:opacity-60"
          />
          <span className="text-sm text-loam">Council has confirmed pick-up date and location of collected litter</span>
        </label>
      </div>

      {/* Status badge */}
      {collectionOrganised ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl mb-3">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-emerald-700">Council collection confirmed</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl mb-3">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-sm font-medium text-amber-700">Litter collection not organised</span>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-stone-400 leading-relaxed">
        If this event goes ahead without organised council collection then the organisers
        and volunteers are responsible for suitable disposal of the collected litter.
      </p>
    </Card>
  );
}
