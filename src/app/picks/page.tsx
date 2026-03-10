'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import PickCard from '@/components/picks/PickCard';
import type { PickWithDetails } from '@/types/database';

type Filter = 'all' | 'this_week';

export default function PicksPage() {
  const [picks, setPicks] = useState<PickWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch('/api/picks')
      .then((r) => r.json())
      .then((data) => {
        setPicks(data.picks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  const filteredPicks = filter === 'this_week'
    ? picks.filter((p) => new Date(p.proposed_time) <= endOfWeek)
    : picks;

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-loam">Join a Litter Pick</h1>
              <p className="text-sm text-weathered mt-0.5">Join a pick or organise your own</p>
            </div>
            <Link href="/picks/new">
              <Button size="sm">Organise</Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              All upcoming
            </button>
            <button
              onClick={() => setFilter('this_week')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'this_week'
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              This week
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {/* Picks list */}
          {!loading && filteredPicks.length > 0 && (
            <div className="space-y-3">
              {filteredPicks.map((pick) => (
                <PickCard key={pick.id} pick={pick} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredPicks.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-stone-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-sm text-weathered">No upcoming picks yet</p>
              <p className="text-xs text-stone-400 mt-1">Be the first to organise one!</p>
              <Link href="/picks/new" className="inline-block mt-4">
                <Button size="sm">Organise a pick</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
