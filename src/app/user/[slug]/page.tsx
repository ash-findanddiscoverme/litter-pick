'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import HeatMap from '@/components/map/HeatMap';
import type { HeatMapHandle } from '@/components/map/HeatMap';
import { createClient } from '@/lib/supabase/client';

interface PublicProfile {
  id: string;
  first_name: string;
  avatar_url: string | null;
  volunteer_type: string;
  postcode_or_town: string;
  created_at: string;
  profile_slug: string | null;
  is_own_profile: boolean;
  stats?: { cleanups_joined: number; cleanups_completed: number; areas_helped: number };
  volunteer_area?: { lat: number | null; lng: number | null; radius_km: number | null };
  equipment?: Record<string, string | null>;
  communities?: Array<{ id: string; name: string; photo_url: string | null; area_name: string | null; role: string }>;
  picks?: Array<{ id: string; status: string; proposed_time: string | null; volunteer_count: number; role: string }>;
  reports?: Array<{ id: string; image_url: string; severity: string; submitted_at: string }>;
  panels: Record<string, boolean>;
}

function circleBounds(lng: number, lat: number, radiusKm: number) {
  const earthRadius = 6371;
  const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
  const lngDelta = (radiusKm / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return { sw: [lng - lngDelta, lat - latDelta] as [number, number], ne: [lng + lngDelta, lat + latDelta] as [number, number] };
}

const EQUIPMENT_LABELS: Record<string, string> = {
  equipment_bags: 'Bags',
  equipment_bag_hoop: 'Bag hoop',
  equipment_gloves: 'Gloves',
  equipment_litter_picker: 'Litter picker',
};

const STATUS_LABELS: Record<string, string> = {
  own: 'Own',
  borrow: 'Need to borrow',
  dont_need: "Don't need",
};

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<HeatMapHandle>(null);

  // Set noindex meta tag
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => { meta?.setAttribute('content', ''); };
  }, []);

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  // Fetch profile data
  useEffect(() => {
    if (!authChecked) return;
    fetch(`/api/users/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null; }
        if (r.status === 404) { setError('User not found'); setLoading(false); return null; }
        if (!r.ok) throw new Error('Failed to load profile');
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.is_own_profile) {
          router.push('/profile');
          return;
        }
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [slug, authChecked, router]);

  // Fit map
  useEffect(() => {
    if (!profile?.volunteer_area?.lat || !profile?.volunteer_area?.lng || !profile?.volunteer_area?.radius_km) return;
    const fit = () => {
      if (mapRef.current) {
        const { sw, ne } = circleBounds(
          profile.volunteer_area!.lng!,
          profile.volunteer_area!.lat!,
          profile.volunteer_area!.radius_km!
        );
        mapRef.current.fitBounds(sw, ne, 30);
        return true;
      }
      return false;
    };
    if (!fit()) {
      const timer = setInterval(() => { if (fit()) clearInterval(timer); }, 100);
      return () => clearInterval(timer);
    }
  }, [profile]);

  if (loading || !authChecked) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16">
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <h1 className="font-display text-2xl font-bold text-loam">{error || 'User not found'}</h1>
            <p className="text-weathered mt-2">This profile may not exist or is not available.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const volunteerTypeLabels: Record<string, string> = {
    solo: 'Solo volunteer',
    group: 'Group volunteer',
    organise: 'Organiser',
  };

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.first_name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
            ) : (
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-brand-500">
                  {(profile.first_name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-loam">{profile.first_name}</h1>
            <p className="text-sm text-weathered mt-1">
              {volunteerTypeLabels[profile.volunteer_type] || 'Volunteer'}
              {profile.postcode_or_town ? ` \u00B7 ${profile.postcode_or_town}` : ''}
            </p>
            <p className="text-xs text-stone-400 mt-1">Member since {memberSince}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stats */}
            {profile.panels.show_stats && profile.stats && (
              <Card>
                <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-loam">{profile.stats.cleanups_joined}</p>
                    <p className="text-xs text-weathered">Joined</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-loam">{profile.stats.cleanups_completed}</p>
                    <p className="text-xs text-weathered">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-loam">{profile.stats.areas_helped}</p>
                    <p className="text-xs text-weathered">Areas</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Equipment */}
            {profile.panels.show_equipment && profile.equipment && (
              <Card>
                <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">Kit</h3>
                <div className="space-y-2">
                  {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => {
                    const val = profile.equipment?.[key];
                    if (!val) return null;
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-loam">{label}</span>
                        <span className="text-weathered">{STATUS_LABELS[val] || val}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Volunteer area */}
            {profile.panels.show_area && profile.volunteer_area?.lat && profile.volunteer_area?.lng && profile.volunteer_area?.radius_km && (
              <Card>
                <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">Volunteer area</h3>
                <div className="relative rounded-xl overflow-hidden" style={{ height: 180 }}>
                  <HeatMap
                    ref={mapRef}
                    initialCenter={[profile.volunteer_area.lng!, profile.volunteer_area.lat!]}
                    initialZoom={13}
                    radiusCircle={{
                      lng: profile.volunteer_area.lng!,
                      lat: profile.volunteer_area.lat!,
                      radiusKm: profile.volunteer_area.radius_km!,
                    }}
                    className="absolute inset-0"
                  />
                </div>
              </Card>
            )}

            {/* Communities */}
            {profile.panels.show_communities && profile.communities && profile.communities.length > 0 && (
              <Card>
                <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">Communities</h3>
                <div className="space-y-2">
                  {profile.communities.map((c) => (
                    <Link key={c.id} href={`/communities/${c.id}`}>
                      <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-stone-50 transition-colors">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-brand-50 flex-shrink-0">
                          {c.photo_url ? (
                            <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-loam truncate">{c.name}</p>
                          {c.area_name && <span className="text-xs text-weathered">{c.area_name}</span>}
                        </div>
                        <Badge variant={c.role === 'admin' ? 'success' : 'default'} className="text-[10px]">
                          {c.role === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Reports */}
            {profile.panels.show_reports && profile.reports && profile.reports.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">Reports</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 rounded-2xl overflow-hidden">
                  {profile.reports.map((report) => (
                    <Link key={report.id} href={`/report/${report.id}`}>
                      <div className="relative aspect-square group cursor-pointer">
                        <img src={report.image_url} alt={`Litter report`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                          <div className="w-full px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              report.severity === 'bad' ? 'bg-red-500 text-white'
                              : report.severity === 'medium' ? 'bg-amber-400 text-amber-900'
                              : 'bg-green-100 text-green-700'
                            }`}>{report.severity}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
