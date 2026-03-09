'use client';

import { useEffect, useState, useRef } from 'react';
import HeatMap from '@/components/map/HeatMap';
import type { HeatMapHandle } from '@/components/map/HeatMap';
import Button from '@/components/ui/Button';

interface RadiusSetupProps {
  postcodeOrTown: string;
  /** Pre-existing center [lng, lat] when editing */
  existingCenter?: [number, number];
  /** Pre-existing radius when editing */
  existingRadiusKm?: number;
  /** Label for the skip/cancel button */
  cancelLabel?: string;
  onComplete: () => void;
}

/** Slider steps in km — from 500m up to 10km */
const SLIDER_STEPS = [
  0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10,
];

function formatRadius(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km}km`;
}

/**
 * Calculate bounding box for a circle so fitBounds keeps the edge in view.
 * Uses simple flat-Earth approximation (fine for <10km).
 */
function circleBounds(
  lng: number,
  lat: number,
  radiusKm: number
): { sw: [number, number]; ne: [number, number] } {
  const earthRadius = 6371;
  const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
  const lngDelta = (radiusKm / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return {
    sw: [lng - lngDelta, lat - latDelta],
    ne: [lng + lngDelta, lat + latDelta],
  };
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function RadiusSetup({
  postcodeOrTown,
  existingCenter,
  existingRadiusKm,
  cancelLabel = 'Skip for now',
  onComplete,
}: RadiusSetupProps) {
  const [center, setCenter] = useState<[number, number] | null>(existingCenter || null);

  // Find the closest slider step for an existing value, default to 1km
  const initialStep = existingRadiusKm
    ? SLIDER_STEPS.reduce((closest, step, i) =>
        Math.abs(step - existingRadiusKm) < Math.abs(SLIDER_STEPS[closest] - existingRadiusKm) ? i : closest, 0)
    : SLIDER_STEPS.indexOf(1); // default 1km

  const [stepIndex, setStepIndex] = useState(initialStep);
  const radiusKm = SLIDER_STEPS[stepIndex];

  const [geocoding, setGeocoding] = useState(!existingCenter);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<HeatMapHandle>(null);

  // Location search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Geocode the postcode/town on mount (skip if we already have coordinates)
  useEffect(() => {
    if (existingCenter) return;

    async function geocode() {
      if (!postcodeOrTown) {
        setError('No location provided.');
        setGeocoding(false);
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(postcodeOrTown)}&countrycodes=gb&limit=1`,
          { headers: { Accept: 'application/json' } }
        );
        const data = await res.json();
        if (data?.[0]) {
          const lng = parseFloat(data[0].lon);
          const lat = parseFloat(data[0].lat);
          setCenter([lng, lat]);
        } else {
          setError('Could not find that location. You can skip this step and set it later.');
        }
      } catch {
        setError('Failed to look up location. You can skip and set this later.');
      }
      setGeocoding(false);
    }
    geocode();
  }, [postcodeOrTown, existingCenter]);

  // Fit the map to the circle bounds whenever radius or center changes.
  // On initial mount the map ref may not be ready yet, so retry briefly.
  useEffect(() => {
    if (!center) return;
    const fit = () => {
      if (mapRef.current) {
        const { sw, ne } = circleBounds(center[0], center[1], radiusKm);
        mapRef.current.fitBounds(sw, ne, 40);
        return true;
      }
      return false;
    };
    if (!fit()) {
      const timer = setInterval(() => {
        if (fit()) clearInterval(timer);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [radiusKm, center]);

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
          { headers: { Accept: 'application/json' } }
        );
        const data: SearchResult[] = await res.json();
        setSearchResults(data);
        setShowResults(data.length > 0);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);
    setCenter([lng, lat]);
    setSearchQuery(result.display_name.split(',')[0]);
    setShowResults(false);
    setSearchResults([]);
  };

  /** When user taps the map (in pick mode), move center there */
  const handleMapLocationSelect = (lng: number, lat: number) => {
    setCenter([lng, lat]);
  };

  const handleSave = async () => {
    if (!center) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/volunteers/radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: center[1],
          longitude: center[0],
          radius_km: radiusKm,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  if (geocoding) {
    return (
      <div className="text-center py-12">
        <svg className="animate-spin h-10 w-10 text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-weathered mt-4">Finding your location...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-loam">
          {existingRadiusKm ? 'Edit your volunteer area' : 'Set your volunteer area'}
        </h2>
        <p className="text-sm text-weathered mt-1">
          How far are you willing to go to help clean up?
        </p>
      </div>

      {/* Location search */}
      <div ref={searchContainerRef} className="relative">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search for a town or postcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-loam placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          />
          {searching && (
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-4 py-2.5 text-sm text-loam hover:bg-brand-50 transition-colors border-b border-stone-50 last:border-0"
              >
                <span className="line-clamp-1">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {center ? (
        <>
          {/* Map — pick mode enabled so user can tap to reposition */}
          <div className="relative rounded-2xl overflow-hidden" style={{ height: 300 }}>
            <HeatMap
              ref={mapRef}
              initialCenter={center}
              initialZoom={14}
              pickMode
              onLocationSelect={handleMapLocationSelect}
              radiusCircle={{ lng: center[0], lat: center[1], radiusKm }}
              className="absolute inset-0"
            />
          </div>

          {/* Radius slider */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-loam">Distance</span>
              <span className="text-sm font-bold text-brand-500">{formatRadius(radiusKm)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={SLIDER_STEPS.length - 1}
              step={1}
              value={stepIndex}
              onChange={(e) => setStepIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-100 rounded-full appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-xs text-stone-300 mt-1">
              <span>500m</span>
              <span>10km</span>
            </div>
          </div>
        </>
      ) : null}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      <div className="space-y-2">
        {center && (
          <Button
            fullWidth
            size="lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save my area'}
          </Button>
        )}
        <button
          onClick={onComplete}
          className="w-full text-sm text-stone-400 hover:text-weathered text-center py-2"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
