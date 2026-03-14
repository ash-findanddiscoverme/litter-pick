'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HotspotCard from '@/components/hotspot/HotspotCard';
import Button from '@/components/ui/Button';
import type { Hotspot } from '@/types/database';
import { getStoredLocation, requestUserLocation } from '@/lib/location';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface HotspotWithDistance extends Hotspot {
  distance?: number;
}

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState<HotspotWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'found' | 'not_found'>('loading');

  useEffect(() => {
    fetch('/api/hotspots?status=needs_attention')
      .then((r) => r.json())
      .then((data) => {
        setHotspots(data.hotspots || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setUserLocation({ lat: stored.lat, lng: stored.lng });
      setLocationStatus('found');
      return;
    }
    requestUserLocation().then((loc) => {
      if (loc) {
        setUserLocation(loc);
        setLocationStatus('found');
      } else {
        setLocationStatus('not_found');
      }
    });
  }, []);

  const sortedHotspots = useCallback(() => {
    if (!userLocation) {
      return hotspots.map((h) => ({ ...h, distance: undefined }));
    }

    return hotspots
      .map((h) => ({
        ...h,
        distance: haversineDistance(
          userLocation.lat,
          userLocation.lng,
          h.centroid_latitude,
          h.centroid_longitude
        ),
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [hotspots, userLocation]);

  const displayHotspots = sortedHotspots();

  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-loam">Hotspots near you</h1>
            <p className="text-sm text-weathered mt-2 flex items-center gap-2">
              {locationStatus === 'loading' ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Finding your location...
                </>
              ) : locationStatus === 'found' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  Sorted by distance from your location
                </>
              ) : (
                'Showing all hotspots'
              )}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : displayHotspots.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-50 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-loam">Looking good!</h3>
              <p className="text-sm text-weathered mt-1">No hotspots need attention right now.</p>
              <p className="text-xs text-stone-400 mt-1">Check back later or report litter you find.</p>
              <a href="/report" className="inline-block mt-6">
                <Button>Report litter</Button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {displayHotspots.map((h) => (
                <HotspotCard 
                  key={h.id} 
                  hotspot={h} 
                  distanceKm={h.distance}
                />
              ))}
            </div>
          )}

          <div className="mt-10 p-6 bg-stone-50 rounded-3xl">
            <p className="text-sm text-weathered text-center mb-4">Want to explore more?</p>
            <div className="flex gap-3">
              <a href="/map" className="flex-1">
                <Button fullWidth variant="outline">View map</Button>
              </a>
              <a href="/report" className="flex-1">
                <Button fullWidth>Report litter</Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
