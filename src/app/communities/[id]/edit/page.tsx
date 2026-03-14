'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CommunityForm from '@/components/community/CommunityForm';
import { createClient } from '@/lib/supabase/client';
import type { Community } from '@/types/database';

export default function EditCommunityPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/volunteer');
          return;
        }

        // Fetch community
        const res = await fetch(`/api/communities/${communityId}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/communities');
            return;
          }
          throw new Error('Failed to fetch community');
        }

        const data = await res.json();

        // Check if user is admin
        if (data.community.user_role !== 'admin') {
          router.push(`/communities/${communityId}`);
          return;
        }

        setCommunity(data.community);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId, router]);

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

  if (error) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 md:pt-[72px]">
          <div className="max-w-lg mx-auto px-4 py-8 text-center">
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
            <Link href="/communities" className="mt-4 inline-block text-brand-600 hover:underline">
              Back to communities
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!community) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href={`/communities/${communityId}`}
            className="inline-flex items-center gap-1.5 text-sm text-weathered hover:text-loam transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to community
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-loam">
              Edit community
            </h1>
            <p className="text-weathered mt-2">
              Update your community details
            </p>
          </div>

          {/* Form */}
          <CommunityForm mode="edit" community={community} />
        </div>
      </main>
      <Footer />
    </>
  );
}
