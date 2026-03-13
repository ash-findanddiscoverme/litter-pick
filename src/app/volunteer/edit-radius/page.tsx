'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RadiusSetup from '@/components/volunteer/RadiusSetup';

export default function EditRadiusPage() {
  const [postcode, setPostcode] = useState<string | null>(null);
  const [existingRadius, setExistingRadius] = useState<number | undefined>(undefined);
  const [existingCenter, setExistingCenter] = useState<[number, number] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login');
          return null;
        }
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data?.user) {
          setPostcode(data.user.postcode_or_town || '');
          if (data.user.volunteer_radius_km) {
            setExistingRadius(data.user.volunteer_radius_km);
          }
          if (data.user.volunteer_lat && data.user.volunteer_lng) {
            setExistingCenter([data.user.volunteer_lng, data.user.volunteer_lat]);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

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

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-md mx-auto px-4 py-6">
          <RadiusSetup
            postcodeOrTown={postcode || ''}
            existingCenter={existingCenter}
            existingRadiusKm={existingRadius}
            onComplete={() => router.push('/profile')}
            cancelLabel="Back to profile"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
