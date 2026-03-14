'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import CommunityCard from '@/components/community/CommunityCard';
import { haversineDistance } from '@/lib/utils';
import type { CommunityWithMeta } from '@/types/database';

type SortMode = 'newest' | 'nearest';

interface UserLocation {
  lat: number;
  lng: number;
  source: 'profile' | 'browser';
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<CommunityWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch communities
  useEffect(() => {
    const params = new URLSearchParams();
    if (userLocation) {
      params.set('lat', userLocation.lat.toString());
      params.set('lng', userLocation.lng.toString());
    }

    fetch(`/api/communities?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setCommunities(data.communities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userLocation]);

  // Get location from profile if logged in
  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const client = createClient();
      client.auth.getSession().then(({ data }) => {
        if (!data.session) return;
        fetch('/api/auth/profile')
          .then((r) => r.ok ? r.json() : null)
          .then((profile) => {
            if (profile?.user?.volunteer_lat && profile?.user?.volunteer_lng) {
              setUserLocation({
                lat: profile.user.volunteer_lat,
                lng: profile.user.volunteer_lng,
                source: 'profile',
              });
              setSortMode('nearest');
            }
          })
          .catch(() => {});
      });
    });
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
    (community: CommunityWithMeta): number | null => {
      if (!userLocation) return null;
      return haversineDistance(userLocation.lat, userLocation.lng, community.center_lat, community.center_lng);
    },
    [userLocation]
  );

  // Filter by search
  let displayCommunities = search
    ? communities.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()) ||
          c.area_name?.toLowerCase().includes(search.toLowerCase())
      )
    : [...communities];

  // Sort
  if (sortMode === 'nearest' && userLocation) {
    displayCommunities.sort((a, b) => {
      const distA = getDistance(a) ?? Infinity;
      const distB = getDistance(b) ?? Infinity;
      return distA - distB;
    });
  } else {
    displayCommunities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-loam">
                Communities
              </h1>
              <p className="text-weathered mt-1">
                Find and join local litter picking groups
              </p>
            </div>
            <Link href="/communities/new">
              <Button>Create</Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-stone-200 rounded-2xl text-loam placeholder:text-stone-400 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
            />
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wide mr-1">
              Sort
            </span>
            <button
              onClick={() => setSortMode('newest')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortMode === 'newest'
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => {
                if (userLocation) {
                  setSortMode('nearest');
                } else {
                  requestBrowserLocation();
                }
              }}
              disabled={locationLoading}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                sortMode === 'nearest'
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {locationLoading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Locating...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Nearest
                </>
              )}
            </button>
          </div>

          {/* Communities list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : displayCommunities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-loam">
                {search ? 'No communities found' : 'No communities yet'}
              </h3>
              <p className="text-weathered mt-1 mb-6">
                {search
                  ? 'Try a different search term'
                  : 'Be the first to create a community in your area'}
              </p>
              {!search && (
                <Link href="/communities/new">
                  <Button>Create a community</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  distanceKm={sortMode === 'nearest' ? getDistance(community) : null}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
