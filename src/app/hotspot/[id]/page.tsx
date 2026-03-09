'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import VolunteerInterestButton from '@/components/hotspot/VolunteerInterestButton';
import { hotspotStatusLabel, hotspotStatusColor, formatDate, formatPickDate } from '@/lib/utils';
import type { Hotspot, Cleanup } from '@/types/database';

export const runtime = 'edge';

export default function HotspotDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [cleanup, setCleanup] = useState<Cleanup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hotspots/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setHotspot(data.hotspot || null);
        setCleanup(data.cleanup || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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

  if (!hotspot) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <p className="text-weathered">Hotspot not found</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {/* Status and title */}
          <div>
            <Badge className={hotspotStatusColor(hotspot.status)}>
              {hotspotStatusLabel(hotspot.status)}
            </Badge>
            <h1 className="text-2xl font-bold text-loam mt-2">
              {hotspot.area_name || 'Litter hotspot'}
            </h1>
            <p className="text-sm text-weathered mt-1">
              {hotspot.report_count} reports · Score: {hotspot.score} · Updated {formatDate(hotspot.updated_at)}
            </p>
          </div>

          {/* Before / After images */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-weathered mb-1.5">Before</p>
              {hotspot.latest_before_image_url ? (
                <img
                  src={hotspot.latest_before_image_url}
                  alt="Before cleanup"
                  className="w-full h-40 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-40 bg-stone-100 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-stone-300">No photo yet</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-weathered mb-1.5">After</p>
              {hotspot.latest_after_image_url ? (
                <img
                  src={hotspot.latest_after_image_url}
                  alt="After cleanup"
                  className="w-full h-40 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-40 bg-stone-100 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-stone-300">Not yet cleared</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <Card>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-loam">{hotspot.report_count}</p>
                <p className="text-xs text-weathered">Reports</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-loam">{hotspot.volunteer_interest_count}</p>
                <p className="text-xs text-weathered">Interested</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-loam">{hotspot.score}</p>
                <p className="text-xs text-weathered">Score</p>
              </div>
            </div>
          </Card>

          {/* Cleanup info */}
          {cleanup && (
            <Card>
              <h3 className="text-sm font-semibold text-loam mb-2">Clean-up planned</h3>
              <p className="text-sm text-weathered">
                Status: {cleanup.status}
                {cleanup.proposed_time && ` · ${new Date(cleanup.proposed_time).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}
              </p>
              {cleanup.status === 'scheduled' || cleanup.status === 'in_progress' ? (
                <a href={`/cleanup/${cleanup.id}`} className="block mt-3">
                  <Button size="sm" fullWidth>View clean-up details</Button>
                </a>
              ) : null}
            </Card>
          )}

          {/* Volunteer interest */}
          {hotspot.status !== 'cleaned' && (
            <Card>
              <VolunteerInterestButton hotspotId={hotspot.id} />
            </Card>
          )}

          {/* Organise a pick */}
          {hotspot.status !== 'cleaned' && (
            <a href={`/picks/new?hotspot_id=${hotspot.id}`}>
              <Button fullWidth variant="outline">
                <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Organise a pick
              </Button>
            </a>
          )}

          {/* Scheduled pick info */}
          {cleanup && cleanup.status === 'scheduled' && cleanup.proposed_time && (
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <h3 className="text-sm font-semibold text-loam">Pick scheduled</h3>
              </div>
              <p className="text-sm text-brand-500 font-medium">{formatPickDate(cleanup.proposed_time)}</p>
              <p className="text-xs text-stone-400 mt-1">{cleanup.volunteer_count} {cleanup.volunteer_count === 1 ? 'person' : 'people'} joining</p>
            </Card>
          )}

          {/* Completion link */}
          {(hotspot.status === 'cleanup_forming' || hotspot.status === 'needs_attention') && cleanup && (
            <a href={`/cleanup/${cleanup.id}`}>
              <Button fullWidth variant="secondary">
                Upload after photo / mark complete
              </Button>
            </a>
          )}

          <div className="flex gap-2">
            <a href="/picks" className="block flex-1">
              <Button fullWidth variant="secondary">
                View all picks
              </Button>
            </a>
            <a href="/map" className="block flex-1">
              <Button fullWidth variant="ghost">
                Back to map
              </Button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
