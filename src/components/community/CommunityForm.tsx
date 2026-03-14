'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import type { Community } from '@/types/database';

interface CommunityFormProps {
  community?: Community;
  mode: 'create' | 'edit';
}

const RADIUS_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 50];

export default function CommunityForm({ community, mode }: CommunityFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(community?.name || '');
  const [description, setDescription] = useState(community?.description || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(community?.photo_url || null);
  const [radiusKm, setRadiusKm] = useState(community?.radius_km || 5);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    community ? { lat: community.center_lat, lng: community.center_lng } : null
  );
  const [locationName, setLocationName] = useState(community?.area_name || '');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [photo]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12`,
            { headers: { 'User-Agent': 'LitterPick/1.0' } }
          );
          const data = await res.json();
          const addr = data.address;
          const place = addr?.town || addr?.city || addr?.village || addr?.suburb || addr?.county || '';
          setLocationName(place);
        } catch {
          setLocationName('Location set');
        }

        setLocating(false);
      },
      (err) => {
        setError(`Failed to get location: ${err.message}`);
        setLocating(false);
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

    if (!location) {
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
      formData.append('center_lat', location.lat.toString());
      formData.append('center_lng', location.lng.toString());
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

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-loam mb-2">
          Community location
        </label>
        {location ? (
          <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl border border-brand-100">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-loam">{locationName || 'Location set'}</p>
              <p className="text-xs text-weathered">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleGetLocation}
              disabled={locating}
            >
              Update
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleGetLocation}
            disabled={locating}
            className="w-full"
          >
            {locating ? (
              <>
                <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Getting location...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Use my location
              </>
            )}
          </Button>
        )}
        <p className="text-xs text-weathered mt-2">
          This is the center point of your community area
        </p>
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
