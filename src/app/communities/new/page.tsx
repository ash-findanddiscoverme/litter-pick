'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CommunityForm from '@/components/community/CommunityForm';
import { createClient } from '@/lib/supabase/client';

export default function NewCommunityPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/volunteer');
      } else {
        setAuthed(true);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 md:pt-[72px]">
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="flex justify-center py-12">
              <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!authed) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href="/communities"
            className="inline-flex items-center gap-1.5 text-sm text-weathered hover:text-loam transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to communities
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-loam">
              Create a community
            </h1>
            <p className="text-weathered mt-2">
              Start a local group to organize litter picks in your area
            </p>
          </div>

          {/* Form */}
          <CommunityForm mode="create" />
        </div>
      </main>
      <Footer />
    </>
  );
}
