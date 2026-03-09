'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HeatMap from '@/components/map/HeatMap';
import { formatDate } from '@/lib/utils';
import type { Report, Hotspot, ReportSeverity } from '@/types/database';

type HotspotSummary = Pick<Hotspot, 'id' | 'area_name' | 'status' | 'score' | 'report_count'>;

const severityOptions: { value: ReportSeverity; label: string; color: string; activeColor: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-stone-100 text-stone-500', activeColor: 'bg-green-100 text-green-700 ring-2 ring-green-400' },
  { value: 'medium', label: 'Medium', color: 'bg-stone-100 text-stone-500', activeColor: 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' },
  { value: 'bad', label: 'Bad', color: 'bg-stone-100 text-stone-500', activeColor: 'bg-red-100 text-red-700 ring-2 ring-red-400' },
];

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [hotspot, setHotspot] = useState<HotspotSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState<ReportSeverity>('low');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmClean, setConfirmClean] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Report not found');
        return r.json();
      })
      .then((data) => {
        setReport(data.report);
        setHotspot(data.hotspot || null);
        setSeverity(data.report.severity);
        // We'll check ownership via a separate auth check
        checkOwnership(data.report.user_id);
        setLoading(false);
      })
      .catch(() => {
        setError('Report not found');
        setLoading(false);
      });
  }, [id]);

  const checkOwnership = async (reportUserId: string | null) => {
    if (!reportUserId) return;
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user && data.user.id === reportUserId) {
        setIsOwner(true);
      }
    } catch {
      // Not logged in
    }
  };

  const handleSaveSeverity = async () => {
    if (!report || severity === report.severity) return;
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      const { report: updated } = await res.json();
      setReport(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCleaned = async () => {
    if (!report) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cleaned' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      const { report: updated } = await res.json();
      setReport(updated);
      setConfirmClean(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
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

  if (!report) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-weathered">{error || 'Report not found'}</p>
            <button onClick={() => router.back()} className="text-sm text-brand-500 hover:text-brand-600 underline">
              Go back
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isCleaned = report.status === 'cleaned';

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-weathered hover:text-loam transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>

          {/* Photo */}
          {report.image_url && (
            <div className="rounded-2xl overflow-hidden">
              <img
                src={report.image_url}
                alt={`Litter report — ${report.severity}`}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Status badges */}
          <div className="flex items-center gap-2">
            <Badge className={
              report.severity === 'bad'
                ? 'bg-red-100 text-red-700'
                : report.severity === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
            }>
              {report.severity}
            </Badge>
            {isCleaned && (
              <Badge className="bg-emerald-100 text-emerald-700">Cleaned up</Badge>
            )}
            <span className="text-xs text-stone-400 ml-auto">{formatDate(report.submitted_at)}</span>
          </div>

          {/* Note */}
          {report.note && (
            <p className="text-sm text-weathered">{report.note}</p>
          )}

          {/* Mini map */}
          <Card>
            <h3 className="text-sm font-semibold text-loam mb-2">Location</h3>
            <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
              <HeatMap
                initialCenter={[report.longitude, report.latitude]}
                initialZoom={15}
                pickMode={false}
                className="absolute inset-0"
              />
              {/* Pin overlay in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-8 h-8 text-red-500 -mt-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Severity editor (owner only) */}
          {isOwner && !isCleaned && (
            <Card>
              <h3 className="text-sm font-semibold text-loam mb-3">Adjust severity</h3>
              <div className="flex gap-2">
                {severityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSeverity(opt.value); setSaved(false); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      severity === opt.value ? opt.activeColor : opt.color
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {severity !== report.severity && (
                <Button
                  fullWidth
                  size="sm"
                  onClick={handleSaveSeverity}
                  disabled={saving}
                  className="mt-3"
                >
                  {saving ? 'Saving...' : 'Save severity'}
                </Button>
              )}
              {saved && (
                <p className="text-xs text-green-600 text-center mt-2">Severity updated</p>
              )}
            </Card>
          )}

          {/* Mark as cleaned (owner only) */}
          {isOwner && !isCleaned && (
            <Card>
              {!confirmClean ? (
                <button
                  onClick={() => setConfirmClean(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as cleaned up
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-weathered text-center">
                    Has this area been cleaned up?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      fullWidth
                      size="sm"
                      onClick={handleMarkCleaned}
                      disabled={saving}
                    >
                      {saving ? 'Updating...' : 'Yes, it\'s clean'}
                    </Button>
                    <Button
                      fullWidth
                      size="sm"
                      variant="secondary"
                      onClick={() => setConfirmClean(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Cleaned confirmation */}
          {isCleaned && (
            <Card>
              <div className="text-center py-2">
                <svg className="w-10 h-10 text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-emerald-700">This area has been cleaned up</p>
              </div>
            </Card>
          )}

          {/* View hotspot link */}
          {hotspot && (
            <Link href={`/hotspot/${hotspot.id}`}>
              <Card className="hover:border-brand-200 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-loam">
                      {hotspot.area_name || 'Litter hotspot'}
                    </h3>
                    <p className="text-xs text-weathered mt-0.5">
                      {hotspot.report_count} reports · Score: {hotspot.score}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Card>
            </Link>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}

          {/* Back to profile */}
          <Link href="/profile" className="block">
            <Button fullWidth variant="ghost">Back to profile</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
