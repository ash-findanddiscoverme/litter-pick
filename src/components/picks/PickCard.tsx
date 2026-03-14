'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatPickDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { PickWithDetails } from '@/types/database';

function getStaticMapUrl(lat: number, lng: number): string {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
  return `https://api.maptiler.com/maps/streets-v2/static/${lng},${lat},14/400x200@2x.png?key=${key}`;
}

interface PickImageProps {
  lat: number;
  lng: number;
  hotspotImage: string | null;
}

function PickImage({ lat, lng, hotspotImage }: PickImageProps) {
  const [imageError, setImageError] = useState(false);
  const staticMapUrl = getStaticMapUrl(lat, lng);

  if (hotspotImage && !imageError) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-stone-100 group" style={{ height: 160 }}>
        <img
          src={hotspotImage}
          alt="Hotspot"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-3 right-3 w-16 h-12 rounded-xl overflow-hidden border-2 border-white/80 shadow-soft backdrop-blur-sm">
          <img
            src={staticMapUrl}
            alt="Map"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-stone-100" style={{ height: 160 }}>
      <img
        src={staticMapUrl}
        alt="Map"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

interface PickCardProps {
  pick: PickWithDetails;
  distanceKm?: number | null;
}

export default function PickCard({ pick, distanceKm }: PickCardProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [volunteerCount, setVolunteerCount] = useState(pick.volunteer_count);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setJoining(true);
    setError('');

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push('/volunteer');
      return;
    }

    try {
      const res = await fetch(`/api/picks/${pick.id}/join`, { method: 'POST' });
      const body = await res.json();

      if (res.status === 409) {
        setJoined(true);
        return;
      }

      if (!res.ok) {
        throw new Error(body.error || 'Failed to join');
      }

      setJoined(true);
      setVolunteerCount(body.volunteer_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) return;
    router.push(`/pick/${pick.id}`);
  };

  return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <Card hover variant="elevated">
        <div className="space-y-4">
          {/* Organiser */}
          <div className="flex items-center gap-3">
            {pick.organiser_avatar ? (
              <img
                src={pick.organiser_avatar}
                alt={pick.organiser_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-100"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center ring-2 ring-brand-100">
                <span className="text-sm font-bold text-brand-600">
                  {pick.organiser_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-loam">{pick.organiser_name}</p>
              <p className="text-xs text-weathered">Organiser</p>
            </div>
          </div>

          {/* Hotspot & time */}
          <div>
            <h3 className="font-display text-lg font-semibold text-loam">
              {pick.hotspot_name || 'Litter hotspot'}
            </h3>
            {pick.hotspot_county && (
              <p className="text-sm text-weathered mt-0.5">{pick.hotspot_county}</p>
            )}
            {pick.has_council && !pick.council_notified && !pick.council_collection_confirmed && (
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-sunlight-100 text-sunlight-500 text-xs font-medium rounded-full border border-sunlight-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Collection not organised
              </span>
            )}
            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-600 text-sm font-medium rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {formatPickDate(pick.proposed_time)}
              </span>
              {distanceKm != null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 text-sm font-medium rounded-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {pick.notes && (
            <p className="text-sm text-weathered leading-relaxed">{pick.notes}</p>
          )}

          {/* Image/map + directions */}
          {pick.hotspot_lat && pick.hotspot_lng && (
            <div className="space-y-3">
              <PickImage
                lat={pick.hotspot_lat}
                lng={pick.hotspot_lng}
                hotspotImage={pick.hotspot_image}
              />

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pick.hotspot_lat},${pick.hotspot_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-sm font-medium text-loam transition-colors border border-stone-100"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                Get directions
              </a>
            </div>
          )}

          {/* Footer: volunteer count + join */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="flex items-center gap-1.5 text-sm text-weathered">
              <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="font-medium text-loam">{volunteerCount}</span> {volunteerCount === 1 ? 'person' : 'people'} joining
            </span>

            {joined ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 text-sm font-medium rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Joined
              </span>
            ) : (
              <Button size="sm" onClick={handleJoin} disabled={joining}>
                {joining ? 'Joining...' : 'Join this pick'}
              </Button>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
