'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';

interface ProfileData {
  user: User;
  stats: {
    cleanups_joined: number;
    cleanups_completed: number;
    areas_helped: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-bold text-brand-500">
                {(profile.user.first_name || '?').charAt(0).toUpperCase()}
              </span>
            </div>
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
