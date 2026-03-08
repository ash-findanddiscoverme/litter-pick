'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import HeatMap from '@/components/map/HeatMap';
import HotspotCard from '@/components/hotspot/HotspotCard';
import Button from '@/components/ui/Button';
import type { Hotspot } from '@/types/database';

export default function MapPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const router = useRouter();

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
            hotspots={hotspots}
            onHotspotClick={handleHotspotClick}
            className="absolute inset-0"
          />

          {/* Floating action buttons */}
          <div className="absolute bottom-6 right-4 flex flex-col items-end gap-2">
            <a href="/report">
              <Button size="md" className="shadow-lg">
                Report litter
              </Button>
            </a>
            <button
              onClick={() => setShowList(!showList)}
              className="bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-medium text-loam hover:bg-stone-50 transition-colors"
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
