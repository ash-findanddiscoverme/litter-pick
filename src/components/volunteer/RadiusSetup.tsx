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

export default function RadiusSetup({
  postcodeOrTown,
  existingCenter,
  existingRadiusKm,
  cancelLabel = 'Skip for now',
  onComplete,
}: RadiusSetupProps) {
  const [center, setCenter] = useState<[number, number] | null>(existingCenter || null);
  const [radiusKm, setRadiusKm] = useState(existingRadiusKm || 5);
  const [geocoding, setGeocoding] = useState(!existingCenter);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<HeatMapHandle>(null);

  // Geocode the postcode/town on mount (skip if we already have coordinates)
  useEffect(() => {
    if (existingCenter) return; // Already have coordinates from profile

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

  // Calculate appropriate zoom for the radius
  const getZoomForRadius = (km: number): number => {
    if (km <= 2) return 13;
    if (km <= 5) return 12;
    if (km <= 10) return 11;
    if (km <= 15) return 10;
    return 9;
  };

  // Fly to fit the radius when slider changes
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo(center[0], center[1], getZoomForRadius(radiusKm));
    }
  }, [radiusKm, center]);

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

      {center ? (
        <>
          {/* Map */}
          <div className="relative rounded-2xl overflow-hidden" style={{ height: 300 }}>
            <HeatMap
              ref={mapRef}
              initialCenter={center}
              initialZoom={getZoomForRadius(radiusKm)}
              radiusCircle={{ lng: center[0], lat: center[1], radiusKm }}
              className="absolute inset-0"
            />
          </div>

          {/* Radius slider */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-loam">Distance</span>
              <span className="text-sm font-bold text-brand-500">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-100 rounded-full appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-xs text-stone-300 mt-1">
              <span>1 km</span>
              <span>25 km</span>
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
