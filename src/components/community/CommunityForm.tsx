'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import HeatMap from '@/components/map/HeatMap';
import type { HeatMapHandle } from '@/components/map/HeatMap';
import type { Community } from '@/types/database';

interface CommunityFormProps {
  community?: Community;
  mode: 'create' | 'edit';
}

const RADIUS_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 50];

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

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

export default function CommunityForm({ community, mode }: CommunityFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HeatMapHandle>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(community?.name || '');
  const [description, setDescription] = useState(community?.description || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(community?.photo_url || null);
  const [radiusKm, setRadiusKm] = useState(community?.radius_km || 5);
  const [center, setCenter] = useState<[number, number] | null>(
    community ? [community.center_lng, community.center_lat] : null
  );
  const [locationName, setLocationName] = useState(community?.area_name || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [photo]);

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

  // Fit map to circle bounds when radius or center changes
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
    const placeName = result.display_name.split(',')[0];
    setLocationName(placeName);
    setSearchQuery(placeName);
    setShowResults(false);
    setSearchResults([]);
  };

  const handleMapLocationSelect = (lng: number, lat: number) => {
    setCenter([lng, lat]);
    // Reverse geocode
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12`,
      { headers: { 'User-Agent': 'LitterPick/1.0' } }
    )
      .then((r) => r.json())
      .then((data) => {
        const addr = data.address;
        const place = addr?.town || addr?.city || addr?.village || addr?.suburb || addr?.county || '';
        if (place) setLocationName(place);
      })
      .catch(() => {});
  };

  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleMapLocationSelect(lng, lat);
      },
      (err) => {
        setError(`Failed to get location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      setPhoto(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a community name');
      return;
    }

    if (!center) {
      setError('Please set the community location');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('center_lat', center[1].toString());
      formData.append('center_lng', center[0].toString());
      formData.append('radius_km', radiusKm.toString());
      if (photo) {
        formData.append('photo', photo);
      }

      const url = mode === 'create' 
        ? '/api/communities' 
        : `/api/communities/${community?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save community');
      }

      router.push(`/communities/${data.community.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-loam mb-2">
          Community photo
        </label>
        <div
          onClick={handlePhotoClick}
          className="relative w-full aspect-[3/1] rounded-2xl overflow-hidden bg-stone-100 cursor-pointer hover:bg-stone-200 transition-colors border-2 border-dashed border-stone-200 hover:border-brand-300"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
              <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-sm">Click to add a photo</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* Name */}
      <Input
        label="Community name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Hackney Litter Pickers"
        required
        maxLength={100}
      />

      {/* Description */}
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Tell people what your community is about..."
        rows={3}
        hint="Optional"
      />

      {/* Location with map */}
      <div>
        <label className="block text-sm font-medium text-loam mb-2">
          Community location
        </label>

        {/* Place search */}
        <div ref={searchContainerRef} className="relative mb-3">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search for a town or postcode..."
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-stone-200 rounded-2xl text-loam placeholder:text-stone-400 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all text-sm"
            />
            {searching && (
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
              {searchResults.map((result, i) => (
                <button
                  type="button"
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

        {/* Use my location button if no center set */}
        {!center && (
          <Button
            type="button"
            variant="outline"
            onClick={handleGetBrowserLocation}
            className="w-full mb-3"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Use my location
          </Button>
        )}

        {/* Map with radius */}
        {center && (
          <>
            <div className="relative rounded-2xl overflow-hidden border border-stone-200" style={{ height: 280 }}>
              <HeatMap
                ref={mapRef}
                initialCenter={center}
                initialZoom={12}
                pickMode
                onLocationSelect={handleMapLocationSelect}
                radiusCircle={{ lng: center[0], lat: center[1], radiusKm }}
                className="absolute inset-0"
              />
            </div>
            {locationName && (
              <div className="flex items-center gap-2 mt-2 text-sm text-weathered">
                <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="font-medium text-loam">{locationName}</span>
                <span className="text-stone-400">&middot;</span>
                <span>Tap the map to adjust</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Radius */}
      <div>
        <label className="block text-sm font-medium text-loam mb-2">
          Area radius
        </label>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadiusKm(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                radiusKm === r
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
        <p className="text-xs text-weathered mt-2">
          How far your community covers from the center point
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting
          ? mode === 'create'
            ? 'Creating...'
            : 'Saving...'
          : mode === 'create'
          ? 'Create community'
          : 'Save changes'}
      </Button>
    </form>
  );
}
