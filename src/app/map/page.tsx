'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import HeatMap from '@/components/map/HeatMap';
import type { HeatMapHandle } from '@/components/map/HeatMap';
import HotspotCard from '@/components/hotspot/HotspotCard';
import Button from '@/components/ui/Button';
import type { Hotspot } from '@/types/database';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function MapPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef<HeatMapHandle>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=gb&limit=5&addressdetails=1`,
          { headers: { 'Accept': 'application/json' } }
        );
        const data: SearchResult[] = await res.json();
        setSearchResults(data);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);
    mapRef.current?.flyTo(lng, lat);
    setSearchQuery(result.display_name.split(',')[0]);
    setShowResults(false);
  };

  useEffect(() => {
    fetch('/api/hotspots')
      .then((r) => r.json())
      .then((data) => {
        setHotspots(data.hotspots || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleHotspotClick = (hotspot: Hotspot) => {
    router.push(`/hotspot/${hotspot.id}`);
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-16 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Page heading */}
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
          <h1 className="text-2xl font-bold text-loam">Litter Map - Heat map of reported litter in Oxfordshire</h1>
        </div>

        {/* Early-adopter banner */}
        {!bannerDismissed && (
          <div className="bg-brand-500 text-white px-4 py-3 flex items-center gap-3">
            <p className="flex-1 text-sm leading-snug">
              <span className="font-semibold">Litter Pick is brand new.</span>{' '}
              We need our first volunteers to start logging rubbish across Oxfordshire.
              Spot something? Tap <span className="font-semibold">Report litter</span> and help build the picture.
            </p>
            <button
              onClick={() => setBannerDismissed(true)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Map */}
        <div className="relative flex-1">
          <HeatMap
            ref={mapRef}
            hotspots={hotspots}
            onHotspotClick={handleHotspotClick}
            className="absolute inset-0"
          />

          {/* Search bar */}
          <div ref={searchContainerRef} className="absolute top-3 left-3 right-16 z-10 max-w-sm">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Search for a place..."
                className="w-full pl-9 pr-3 py-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg text-sm text-loam placeholder:text-stone-300 border border-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
              {searching && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
            {showResults && searchResults.length > 0 && (
              <ul className="mt-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-100 overflow-hidden">
                {searchResults.map((result, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left px-3 py-2.5 text-sm text-loam hover:bg-brand-50 transition-colors border-b border-stone-50 last:border-0"
                    >
                      <span className="font-medium">{result.display_name.split(',')[0]}</span>
                      <span className="text-stone-400 text-xs block truncate">
                        {result.display_name.split(',').slice(1).join(',').trim()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Floating action buttons — lifted for mobile browser chrome */}
          <div className="absolute bottom-24 sm:bottom-8 left-4 right-4 flex flex-col items-stretch gap-2 max-w-xs mx-auto">
            <a href="/report" className="block">
              <button className="w-full px-6 py-3 text-base font-semibold rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-lg animate-glow">
                Report litter
              </button>
            </a>
            <button
              onClick={() => setShowList(!showList)}
              className="w-full bg-white shadow-lg rounded-xl px-6 py-3 text-base font-semibold text-loam hover:bg-stone-50 transition-colors"
            >
              {showList ? 'Hide list' : `${hotspots.length} hotspots`}
            </button>
          </div>
        </div>

        {/* Hotspot list panel */}
        {showList && (
          <div className="bg-white border-t border-stone-100 max-h-[40vh] overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p className="text-sm text-weathered text-center py-4">Loading hotspots...</p>
            ) : hotspots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-weathered">No reports in this area yet.</p>
                <p className="text-xs text-stone-300 mt-1">Spot something? Be the first to report.</p>
              </div>
            ) : (
              hotspots.map((h) => <HotspotCard key={h.id} hotspot={h} />)
            )}
          </div>
        )}
      </main>
    </>
  );
}
