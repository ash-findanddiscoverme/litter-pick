'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import HeatMap from '@/components/map/HeatMap';
import { createClient } from '@/lib/supabase/client';
import { checkImageSafety } from '@/lib/moderation';
import type { User } from '@/types/database';

interface ReportPhoto {
  id: string;
  image_url: string;
  severity: string;
  submitted_at: string;
  latitude: number;
  longitude: number;
}

interface ProfileData {
  user: User;
  stats: {
    cleanups_joined: number;
    cleanups_completed: number;
    areas_helped: number;
  };
  reports: ReportPhoto[];
}

/** Resize and convert an image file to WebP using Canvas */
async function convertToWebP(file: File, maxSize = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Crop to square from centre
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
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert image'));
        },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const loadProfile = () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
        return;
      }

      fetch('/api/auth/profile')
        .then((r) => {
          if (!r.ok) throw new Error('Failed to load profile');
          return r.json();
        })
        .then((data) => {
          if (data?.user) {
            setProfile(data);
          } else {
            setError('Could not load profile data');
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Something went wrong');
          setLoading(false);
        });
    });
  };

  useEffect(() => {
    loadProfile();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Check image safety before uploading
      const modResult = await checkImageSafety(file);
      if (!modResult.safe) {
        setError(modResult.reason || 'This image was flagged as inappropriate.');
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Convert to WebP client-side (cropped to square, max 400px)
      const webpBlob = await convertToWebP(file);

      const formData = new FormData();
      formData.append('avatar', webpBlob, 'avatar.webp');

      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { avatar_url } = await res.json();
      setProfile({
        ...profile,
        user: { ...profile.user, avatar_url },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
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
            <button
              onClick={loadProfile}
              className="text-sm text-brand-500 hover:text-brand-600 underline"
            >
              Try again
            </button>
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

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-md mx-auto px-4 py-8 space-y-5">
          {/* Profile header */}
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-20 h-20 rounded-full mx-auto mb-3 group focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2"
            >
              {profile.user.avatar_url ? (
                <img
                  src={profile.user.avatar_url}
                  alt="Profile photo"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-brand-500">
                    {(profile.user.first_name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Hover overlay */}
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
              {/* Always-visible indicator when no photo */}
              {!profile.user.avatar_url && !uploading && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              )}
            </button>
            <h1 className="text-2xl font-bold text-loam">{profile.user.first_name || 'Volunteer'}</h1>
            <p className="text-sm text-weathered mt-1">
              {volunteerTypeLabels[profile.user.volunteer_type] || 'Volunteer'}{profile.user.postcode_or_town ? ` · ${profile.user.postcode_or_town}` : ''}
            </p>
          </div>

          {/* Stats */}
          <Card>
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

          {/* Volunteer area */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-loam">Volunteer area</h3>
                {profile.user.volunteer_radius_km ? (
                  <p className="text-xs text-weathered mt-0.5">
                    {profile.user.volunteer_radius_km < 1
                      ? `${Math.round(profile.user.volunteer_radius_km * 1000)}m`
                      : `${profile.user.volunteer_radius_km}km`} radius
                    {profile.user.postcode_or_town ? ` from ${profile.user.postcode_or_town}` : ''}
                  </p>
                ) : (
                  <p className="text-xs text-weathered mt-0.5">Not set yet</p>
                )}
              </div>
              <a
                href="/volunteer/edit-radius"
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                {profile.user.volunteer_radius_km ? 'Edit' : 'Set up'}
              </a>
            </div>
            {profile.user.volunteer_lat && profile.user.volunteer_lng && profile.user.volunteer_radius_km ? (
              <div className="relative rounded-xl overflow-hidden" style={{ height: 180 }}>
                <HeatMap
                  initialCenter={[profile.user.volunteer_lng, profile.user.volunteer_lat]}
                  initialZoom={13}
                  radiusCircle={{
                    lng: profile.user.volunteer_lng,
                    lat: profile.user.volunteer_lat,
                    radiusKm: profile.user.volunteer_radius_km,
                  }}
                  className="absolute inset-0"
                />
              </div>
            ) : null}
          </Card>

          {/* Report photos */}
          {profile.reports && profile.reports.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-loam">My reports</h3>
                <span className="text-xs text-stone-400">{profile.reports.length} photo{profile.reports.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
                {profile.reports.map((report) => (
                  <div key={report.id} className="relative aspect-square group">
                    <img
                      src={report.image_url}
                      alt={`Litter report — ${report.severity}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                      <div className="w-full px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          report.severity === 'bad'
                            ? 'bg-red-500 text-white'
                            : report.severity === 'medium'
                            ? 'bg-amber-400 text-amber-900'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="space-y-2">
            <a href="/map" className="block">
              <Button fullWidth variant="secondary">Explore the map</Button>
            </a>
            <a href="/report" className="block">
              <Button fullWidth variant="outline">Report litter</Button>
            </a>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-sm text-stone-300 hover:text-weathered text-center py-2"
          >
            Log out
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
