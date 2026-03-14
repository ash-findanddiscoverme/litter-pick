'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import HeatMap from '@/components/map/HeatMap';
import type { HeatMapHandle } from '@/components/map/HeatMap';
import { createClient } from '@/lib/supabase/client';
import EquipmentSection from '@/components/profile/EquipmentSection';
import type { User, EquipmentStatus } from '@/types/database';

interface ReportPhoto {
  id: string;
  image_url: string;
  severity: string;
  submitted_at: string;
  latitude: number;
  longitude: number;
  hotspot_id: string | null;
}

interface UserPick {
  id: string;
  hotspot_id: string;
  hotspot_name: string | null;
  hotspot_county: string | null;
  status: string;
  proposed_time: string | null;
  volunteer_count: number;
  bags_collected: number | null;
  role: 'organiser' | 'volunteer';
}

interface UserCommunity {
  id: string;
  name: string;
  photo_url: string | null;
  area_name: string | null;
  role: string;
}

interface ProfileData {
  user: User;
  stats: {
    cleanups_joined: number;
    cleanups_completed: number;
    areas_helped: number;
  };
  reports: ReportPhoto[];
  picks: UserPick[];
  communities: UserCommunity[];
}

function circleBounds(lng: number, lat: number, radiusKm: number) {
  const earthRadius = 6371;
  const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
  const lngDelta = (radiusKm / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return { sw: [lng - lngDelta, lat - latDelta] as [number, number], ne: [lng + lngDelta, lat + latDelta] as [number, number] };
}

async function convertToWebP(file: File, maxSize = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      const outSize = Math.min(size, maxSize);
      canvas.width = outSize;
      canvas.height = outSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, sx, sy, size, size, 0, 0, outSize, outSize);
      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error('Failed to convert image')); },
        'image/webp',
        0.82
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMapRef = useRef<HeatMapHandle>(null);
  const router = useRouter();

  const loadProfile = () => {
    setLoading(true);
    setError(null);
    fetch('/api/auth/profile')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null; }
        if (!r.ok) throw new Error('Failed to load profile');
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data?.user) setProfile(data);
        else setError('Could not load profile data');
        setLoading(false);
      })
      .catch((err) => { setError(err.message || 'Something went wrong'); setLoading(false); });
  };

  useEffect(() => { loadProfile(); }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profile) return;
    fetch('/api/admin/check')
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!profile?.user.volunteer_lat || !profile?.user.volunteer_lng || !profile?.user.volunteer_radius_km) return;
    const fit = () => {
      if (profileMapRef.current) {
        const { sw, ne } = circleBounds(profile.user.volunteer_lng!, profile.user.volunteer_lat!, profile.user.volunteer_radius_km!);
        profileMapRef.current.fitBounds(sw, ne, 30);
        return true;
      }
      return false;
    };
    if (!fit()) {
      const timer = setInterval(() => { if (fit()) clearInterval(timer); }, 100);
      return () => clearInterval(timer);
    }
  }, [profile]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    setUploading(true);
    setError(null);
    try {
      const webpBlob = await convertToWebP(file);
      const formData = new FormData();
      formData.append('avatar', webpBlob, 'avatar.webp');
      const res = await fetch('/api/auth/avatar', { method: 'POST', body: formData });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Upload failed'); }
      const { avatar_url } = await res.json();
      setProfile({ ...profile, user: { ...profile.user, avatar_url } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
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

  if (!profile) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-weathered">{error || 'Could not load profile'}</p>
            <button onClick={loadProfile} className="text-sm text-brand-500 hover:text-brand-600 underline">Try again</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const u = profile.user;
  const show = {
    stats: u.show_stats !== false,
    area: u.show_area !== false,
    equipment: u.show_equipment !== false,
    picks: u.show_picks !== false,
    reports: u.show_reports !== false,
    communities: u.show_communities !== false,
  };

  const volunteerTypeLabels: Record<string, string> = {
    solo: 'Solo volunteer',
    group: 'Group volunteer',
    organise: 'Organiser',
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700' },
    forming: { label: 'Forming', color: 'bg-amber-50 text-amber-700' },
    in_progress: { label: 'In progress', color: 'bg-brand-50 text-brand-600' },
    completed: { label: 'Completed', color: 'bg-green-50 text-green-700' },
    cancelled: { label: 'Cancelled', color: 'bg-stone-100 text-stone-500' },
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile header — always full width */}
          <div className="text-center mb-8">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-20 h-20 rounded-full mx-auto mb-3 group focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2"
            >
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="Profile photo" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-brand-500">{(u.first_name || '?').charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                )}
              </div>
              {!u.avatar_url && !uploading && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              )}
            </button>
            <h1 className="text-2xl font-bold text-loam">{u.first_name || 'Volunteer'}</h1>
            <p className="text-sm text-weathered mt-1">
              {volunteerTypeLabels[u.volunteer_type] || 'Volunteer'}{isAdmin ? ' & Admin' : ''}{u.postcode_or_town ? ` \u00B7 ${u.postcode_or_town}` : ''}
            </p>
            {u.profile_slug && (
              <p className="text-xs text-stone-400 mt-1">
                litterpick.org/user/{u.profile_slug}
              </p>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-loam text-white text-xs font-semibold rounded-lg hover:bg-loam/90 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin console
              </Link>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-6">{error}</p>
          )}

          {/* Flexible grid layout — stacks on mobile, 2 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stats */}
            {show.stats && (
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
            {show.equipment && (
              <Card>
                <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">My kit</h3>
                <EquipmentSection
                  equipment={{
                    equipment_bags: (u.equipment_bags as EquipmentStatus) || null,
                    equipment_bag_hoop: (u.equipment_bag_hoop as EquipmentStatus) || null,
                    equipment_gloves: (u.equipment_gloves as EquipmentStatus) || null,
                    equipment_litter_picker: (u.equipment_litter_picker as EquipmentStatus) || null,
                  }}
                  onChange={(updated) => {
                    setProfile({ ...profile, user: { ...profile.user, ...updated } });
                  }}
                />
              </Card>
            )}

            {/* Volunteer area */}
            {show.area && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide">Volunteer area</h3>
                    {u.volunteer_radius_km ? (
                      <p className="text-xs text-weathered mt-0.5">
                        {u.volunteer_radius_km < 1 ? `${Math.round(u.volunteer_radius_km * 1000)}m` : `${u.volunteer_radius_km}km`} radius
                        {u.postcode_or_town ? ` from ${u.postcode_or_town}` : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-weathered mt-0.5">Not set yet</p>
                    )}
                  </div>
                  <a href="/volunteer/edit-radius" className="text-sm font-medium text-brand-500 hover:text-brand-600">
                    {u.volunteer_radius_km ? 'Edit' : 'Set up'}
                  </a>
                </div>
                {u.volunteer_lat && u.volunteer_lng && u.volunteer_radius_km ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ height: 180 }}>
                    <HeatMap
                      ref={profileMapRef}
                      initialCenter={[u.volunteer_lng, u.volunteer_lat]}
                      initialZoom={13}
                      radiusCircle={{ lng: u.volunteer_lng, lat: u.volunteer_lat, radiusKm: u.volunteer_radius_km }}
                      className="absolute inset-0"
                    />
                  </div>
                ) : null}
                {!u.area_visible && u.area_visible !== undefined && (
                  <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    Hidden from other users
                  </p>
                )}
              </Card>
            )}

            {/* Communities */}
            {show.communities && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide">Communities</h3>
                  <Link href="/communities" className="text-sm font-medium text-brand-500 hover:text-brand-600">
                    Browse
                  </Link>
                </div>
                {profile.communities && profile.communities.length > 0 ? (
                  <div className="space-y-2">
                    {profile.communities.map((c) => (
                      <Link key={c.id} href={`/communities/${c.id}`}>
                        <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-stone-50 transition-colors">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-50 flex-shrink-0">
                            {c.photo_url ? (
                              <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-loam truncate">{c.name}</p>
                            <div className="flex items-center gap-2">
                              {c.area_name && <span className="text-xs text-weathered">{c.area_name}</span>}
                              <Badge variant={c.role === 'admin' ? 'success' : 'default'} className="text-[10px]">
                                {c.role === 'admin' ? 'Admin' : 'Member'}
                              </Badge>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-stone-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-weathered">No communities yet</p>
                    <Link href="/communities/new" className="text-sm text-brand-500 hover:text-brand-600 font-medium mt-1 inline-block">
                      Create or join one
                    </Link>
                  </div>
                )}
              </Card>
            )}

            {/* My Picks — spans full width */}
            {show.picks && profile.picks && profile.picks.length > 0 && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide">My picks</h3>
                  <span className="text-xs text-stone-400">{profile.picks.length} pick{profile.picks.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.picks.map((pick) => {
                    const sc = statusConfig[pick.status] || { label: pick.status, color: 'bg-stone-100 text-stone-500' };
                    return (
                      <Link key={pick.id} href={`/pick/${pick.id}`}>
                        <Card className="hover:shadow-md transition-shadow h-full">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${sc.color}`}>{sc.label}</span>
                                <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                                  pick.role === 'organiser' ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-500'
                                }`}>{pick.role === 'organiser' ? 'Organiser' : 'Joined'}</span>
                              </div>
                              <p className="text-sm font-medium text-loam truncate">{pick.hotspot_name || 'Litter pick'}</p>
                              {pick.hotspot_county && <p className="text-xs text-stone-400">{pick.hotspot_county}</p>}
                              <div className="flex items-center gap-3 mt-1 text-xs text-weathered">
                                {pick.proposed_time && (
                                  <span>{new Date(pick.proposed_time).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                                <span>{pick.volunteer_count} volunteer{pick.volunteer_count !== 1 ? 's' : ''}</span>
                                {pick.status === 'completed' && pick.bags_collected != null && <span>{pick.bags_collected} bags</span>}
                              </div>
                            </div>
                            <svg className="w-4 h-4 text-stone-300 shrink-0 mt-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Report photos — spans full width */}
            {show.reports && profile.reports && profile.reports.length > 0 && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide">My reports</h3>
                  <span className="text-xs text-stone-400">{profile.reports.length} photo{profile.reports.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 rounded-2xl overflow-hidden">
                  {profile.reports.map((report) => (
                    <Link key={report.id} href={`/report/${report.id}`}>
                      <div className="relative aspect-square group cursor-pointer">
                        <img src={report.image_url} alt={`Litter report \u2014 ${report.severity}`} className="w-full h-full object-cover" />
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

          {/* Quick actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <a href="/map" className="flex-1">
              <Button fullWidth variant="secondary">Explore the map</Button>
            </a>
            <a href="/report" className="flex-1">
              <Button fullWidth variant="outline">Report litter</Button>
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 mt-5">
            <a href="/profile/settings" className="text-sm text-weathered hover:text-loam font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
            <span className="text-stone-200">&middot;</span>
            <button onClick={handleLogout} className="text-sm text-stone-300 hover:text-weathered">Log out</button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
