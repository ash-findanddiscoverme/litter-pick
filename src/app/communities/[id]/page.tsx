'use client';

export const runtime = 'edge';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import MemberList from '@/components/community/MemberList';
import { createClient } from '@/lib/supabase/client';
import type { CommunityWithMeta, CommunityMemberWithUser } from '@/types/database';

interface CommunityPick {
  id: string;
  hotspot_id: string;
  proposed_time: string;
  volunteer_count: number;
  status: string;
}

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<CommunityWithMeta | null>(null);
  const [members, setMembers] = useState<CommunityMemberWithUser[]>([]);
  const [picks, setPicks] = useState<CommunityPick[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/communities');
          return;
        }
        throw new Error('Failed to fetch community');
      }
      const data = await res.json();
      setCommunity(data.community);
      setMembers(data.members || []);
      setPicks(data.picks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [communityId, router]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
    fetchCommunity();
  }, [fetchCommunity]);

  const handleJoin = async () => {
    if (!currentUserId) {
      router.push('/volunteer');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/communities/${communityId}/members`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to join');
      }

      await fetchCommunity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this community?')) return;

    setLeaving(true);
    setError('');

    try {
      const res = await fetch(`/api/communities/${communityId}/members`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to leave');
      }

      await fetchCommunity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLeaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this community? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/communities/${communityId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      router.push('/communities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 md:pt-[72px]">
          <div className="max-w-2xl mx-auto px-4 py-8">
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

  if (!community) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 md:pt-[72px]">
          <div className="max-w-2xl mx-auto px-4 py-8 text-center">
            <h1 className="font-display text-2xl font-bold text-loam">Community not found</h1>
            <p className="text-weathered mt-2">This community may have been deleted.</p>
            <Link href="/communities" className="mt-4 inline-block">
              <Button>Back to communities</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isCreator = currentUserId === community.creator_id;
  const isAdmin = community.user_role === 'admin';

  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        <div className="max-w-2xl mx-auto px-4 py-8">
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

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Header with photo */}
          <div className="relative mb-6">
            <div className="aspect-[3/1] rounded-3xl overflow-hidden bg-gradient-to-br from-brand-100 to-moss-100">
              {community.photo_url ? (
                <img
                  src={community.photo_url}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-brand-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Membership badge */}
            {community.is_member && (
              <div className="absolute top-4 right-4">
                <Badge variant="success" className="bg-white/90 backdrop-blur-sm">
                  {community.user_role === 'admin' ? 'Admin' : 'Member'}
                </Badge>
              </div>
            )}
          </div>

          {/* Title and info */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-loam">
              {community.name}
            </h1>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {community.area_name && (
                <span className="inline-flex items-center gap-1.5 text-sm text-weathered">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {community.area_name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-weathered">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                {community.radius_km}km area
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-weathered">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
              </span>
            </div>

            {community.description && (
              <p className="text-weathered mt-4 leading-relaxed">{community.description}</p>
            )}

            {/* Creator info */}
            {community.creator && (
              <div className="flex items-center gap-2 mt-4 text-sm text-weathered">
                <span>Created by</span>
                {community.creator.avatar_url ? (
                  <img
                    src={community.creator.avatar_url}
                    alt={community.creator.first_name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-600">
                      {community.creator.first_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium text-loam">{community.creator.first_name}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            {community.is_member ? (
              <>
                {isAdmin && (
                  <Link href={`/communities/${communityId}/edit`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Edit community
                    </Button>
                  </Link>
                )}
                {!isCreator && (
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={leaving}
                    className="flex-1"
                  >
                    {leaving ? 'Leaving...' : 'Leave community'}
                  </Button>
                )}
                {isCreator && (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={handleJoin} disabled={joining} className="w-full">
                {joining ? 'Joining...' : 'Join this community'}
              </Button>
            )}
          </div>

          {/* Upcoming picks */}
          {picks.length > 0 && (
            <Card className="mb-6">
              <h2 className="font-display text-lg font-semibold text-loam mb-4">
                Upcoming picks
              </h2>
              <div className="space-y-3">
                {picks.map((pick) => (
                  <Link
                    key={pick.id}
                    href={`/pick/${pick.id}`}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-loam text-sm">
                          {new Date(pick.proposed_time).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-xs text-weathered">
                          {pick.volunteer_count} {pick.volunteer_count === 1 ? 'volunteer' : 'volunteers'}
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Members */}
          <Card>
            <h2 className="font-display text-lg font-semibold text-loam mb-4">
              Members ({members.length})
            </h2>
            <MemberList
              members={members}
              creatorId={community.creator_id}
              currentUserId={currentUserId}
              currentUserRole={community.user_role}
              communityId={communityId}
              onMemberUpdate={fetchCommunity}
            />
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
