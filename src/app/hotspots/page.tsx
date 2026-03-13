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
      <main className="flex-1 pt-16">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-loam">Hotspots near you</h1>
            <p className="text-sm text-weathered mt-1">
              {locationStatus === 'loading'
                ? 'Finding your location...'
                : locationStatus === 'found'
                ? 'Sorted by distance from your location'
                : 'Showing all hotspots (location unavailable)'}
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
            <div className="text-center py-12">
              <p className="text-weathered">No hotspots need attention right now.</p>
              <p className="text-sm text-stone-400 mt-2">Check back later or report litter you find.</p>
              <a href="/report" className="block mt-4">
                <Button>Report litter</Button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {displayHotspots.map((h) => (
                <div key={h.id} className="relative">
                  <HotspotCard hotspot={h} />
                  {h.distance !== undefined && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-brand-600 shadow-sm">
                      {h.distance < 1
                        ? `${Math.round(h.distance * 1000)}m away`
                        : `${h.distance.toFixed(1)}km away`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <a href="/map" className="flex-1">
              <Button fullWidth variant="outline">View map</Button>
            </a>
            <a href="/report" className="flex-1">
              <Button fullWidth>Report litter</Button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
