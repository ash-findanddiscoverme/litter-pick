'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import PickCard from '@/components/picks/PickCard';
import { haversineDistance } from '@/lib/utils';
import type { PickWithDetails } from '@/types/database';

type TimeFilter = 'all' | 'this_week';
type SortMode = 'soonest' | 'nearest';

interface UserLocation {
  lat: number;
  lng: number;
  source: 'profile' | 'browser';
}

export default function PicksPage() {
  const [picks, setPicks] = useState<PickWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('soonest');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch picks
  useEffect(() => {
    fetch('/api/picks')
      .then((r) => r.json())
      .then((data) => {
        setPicks(data.picks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Try to get location from profile (if logged in)
  useEffect(() => {
    fetch('/api/auth/profile')
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data?.user?.volunteer_lat && data?.user?.volunteer_lng) {
          setUserLocation({
            lat: data.user.volunteer_lat,
            lng: data.user.volunteer_lng,
            source: 'profile',
          });
          setSortMode('nearest');
        }
      })
      .catch(() => {});
  }, []);

  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: 'browser',
        });
        setSortMode('nearest');
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const getDistance = useCallback(
    (pick: PickWithDetails): number | null => {
      if (!userLocation || !pick.hotspot_lat || !pick.hotspot_lng) return null;
      return haversineDistance(userLocation.lat, userLocation.lng, pick.hotspot_lat, pick.hotspot_lng);
    },
    [userLocation]
  );

  // Filter
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  let displayPicks = timeFilter === 'this_week'
    ? picks.filter((p) => new Date(p.proposed_time) <= endOfWeek)
    : [...picks];

  // Sort
  if (sortMode === 'nearest' && userLocation) {
    displayPicks.sort((a, b) => {
      const distA = getDistance(a) ?? Infinity;
      const distB = getDistance(b) ?? Infinity;
      if (distA !== distB) return distA - distB;
      return new Date(a.proposed_time).getTime() - new Date(b.proposed_time).getTime();
    });
  } else {
    displayPicks.sort((a, b) =>
      new Date(a.proposed_time).getTime() - new Date(b.proposed_time).getTime()
    );
  }

  const hasLocation = !!userLocation;

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

          {/* Sort + filter controls */}
          <div className="space-y-2">
            {/* Sort mode */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wide mr-1">Sort</span>
              <button
                onClick={() => setSortMode('soonest')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  sortMode === 'soonest'
                    ? 'bg-brand-500 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                Soonest
              </button>
              <button
                onClick={() => {
                  if (hasLocation) {
                    setSortMode('nearest');
                  } else {
                    requestBrowserLocation();
                  }
                }}
                disabled={locationLoading}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  sortMode === 'nearest' && hasLocation
                    ? 'bg-brand-500 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {locationLoading ? (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                )}
                Nearest
              </button>
            </div>

            {/* Time filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wide mr-1">When</span>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  timeFilter === 'all'
                    ? 'bg-loam text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                All upcoming
              </button>
              <button
                onClick={() => setTimeFilter('this_week')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  timeFilter === 'this_week'
                    ? 'bg-loam text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                This week
              </button>
            </div>
          </div>

          {/* Location context */}
          {sortMode === 'nearest' && userLocation && (
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Sorted by distance from {userLocation.source === 'profile' ? 'your volunteer area' : 'your current location'}
            </p>
          )}

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
          {!loading && displayPicks.length > 0 && (
            <div className="space-y-3">
              {displayPicks.map((pick) => (
                <PickCard
                  key={pick.id}
                  pick={pick}
                  distanceKm={sortMode === 'nearest' ? getDistance(pick) : null}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && displayPicks.length === 0 && (
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
