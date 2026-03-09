'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { createClient } from '@/lib/supabase/client';
import type { Hotspot } from '@/types/database';

export default function NewPickPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </main>
        <Footer />
      </>
    }>
      <NewPickContent />
    </Suspense>
  );
}

function NewPickContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledHotspotId = searchParams.get('hotspot_id') || '';

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [hotspotId, setHotspotId] = useState(prefilledHotspotId);
  const [proposedTime, setProposedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/volunteer');
      } else {
        setAuthed(true);
      }
    });
  }, [router]);

  // Fetch hotspots for the selector
  useEffect(() => {
    fetch('/api/hotspots')
      .then((r) => r.json())
      .then((data) => setHotspots(data.hotspots || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotspotId || !proposedTime) {
      setError('Please select a hotspot and choose a date/time');
      return;
    }

    const dateObj = new Date(proposedTime);
    if (dateObj <= new Date()) {
      setError('Pick date must be in the future');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotspot_id: hotspotId,
          proposed_time: dateObj.toISOString(),
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create pick');
      }

      router.push('/picks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  // Get minimum datetime (now + 1 hour, rounded to nearest 15 min)
  const getMinDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  if (authed === null) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-md mx-auto px-4 py-6 space-y-5">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-weathered hover:text-loam transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-loam">Organise a pick</h1>
            <p className="text-sm text-weathered mt-1">Choose a hotspot and set a date</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hotspot selector */}
            <Card>
              <Select
                label="Hotspot"
                value={hotspotId}
                onChange={(e) => setHotspotId(e.target.value)}
                required
                options={[
                  { value: '', label: 'Select a hotspot...' },
                  ...hotspots.map((hs) => ({
                    value: hs.id,
                    label: hs.area_name || `Hotspot (${hs.report_count} reports)`,
                  })),
                ]}
              />
            </Card>

            {/* Date/time */}
            <Card>
              <label className="block text-sm font-medium text-loam mb-1.5">
                Date and time
              </label>
              <input
                type="datetime-local"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                min={getMinDateTime()}
                required
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-loam focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </Card>

            {/* Notes */}
            <Card>
              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Meeting point, what to bring, etc."
                rows={3}
              />
            </Card>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <Button fullWidth size="lg" disabled={saving}>
              {saving ? 'Creating...' : 'Create pick'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
