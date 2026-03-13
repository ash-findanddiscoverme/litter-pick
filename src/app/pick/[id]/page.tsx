'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import maplibregl from 'maplibre-gl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PhotoCapture from '@/components/report/PhotoCapture';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { compressImage } from '@/lib/image';
import { MAP_STYLE_URL } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import CouncilSection from '@/components/picks/CouncilSection';
import ShareButton from '@/components/ui/ShareButton';
import QASection from '@/components/picks/QASection';
import { EquipmentIcons, EquipmentSummary } from '@/components/profile/EquipmentSection';
import type { Cleanup, Hotspot, QuestionWithAnswers } from '@/types/database';

export const runtime = 'edge';

interface Volunteer {
  id: string;
  first_name: string;
  avatar_url: string | null;
  interest_type: string;
  equipment_bags: string | null;
  equipment_bag_hoop: string | null;
  equipment_gloves: string | null;
  equipment_litter_picker: string | null;
}

interface Organiser {
  id: string;
  first_name: string;
  avatar_url: string | null;
}

/** Inline map for pick detail */
function PickMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL + key,
      center: [lng, lat],
      zoom: 15,
      interactive: false,
      attributionControl: false,
    });

    new maplibregl.Marker({ color: '#4AA853' })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => { map.remove(); };
  }, [lat, lng]);

  return (
    <div className="rounded-2xl overflow-hidden bg-stone-100" style={{ height: 180 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

type Step = 'info' | 'complete' | 'submitting' | 'success';

export default function CleanupPage() {
  const params = useParams();
  const id = params.id as string;
  const [cleanup, setCleanup] = useState<Cleanup | null>(null);
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [organiser, setOrganiser] = useState<Organiser | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('info');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Completion form
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState('mostly_cleared');
  const [bagsCollected, setBagsCollected] = useState('');
  const [volunteerCount, setVolunteerCount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/cleanups/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCleanup(data.cleanup || null);
        setHotspot(data.hotspot || null);
        setOrganiser(data.organiser || null);
        setVolunteers(data.volunteers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`/api/cleanups/${id}/questions`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || []);
      })
      .catch(() => {});

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, [id]);

  // Dynamic page title and meta description
  useEffect(() => {
    if (!hotspot || !cleanup) return;
    const name = hotspot.area_name || 'Litter hotspot';
    const coords = `${hotspot.centroid_latitude.toFixed(5)}, ${hotspot.centroid_longitude.toFixed(5)}`;

    let dateStr = '';
    if (cleanup.proposed_time) {
      const d = new Date(cleanup.proposed_time);
      dateStr = d.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    document.title = dateStr
      ? `Litter Pick ${name} | ${dateStr}`
      : `Litter Pick ${name}`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', `Join a litter pick at ${name} (${coords}). Help clear the area, team up with locals, and make your community cleaner.`);
  }, [hotspot, cleanup]);

  const handlePhoto = useCallback(async (file: File) => {
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  }, []);

  const handleComplete = async () => {
    setError('');
    setStep('submitting');

    try {
      const formData = new FormData();
      formData.append('cleanup_id', id);
      formData.append('status', completionStatus);
      if (photo) formData.append('after_image', photo);
      if (bagsCollected) formData.append('bags_collected', bagsCollected);
      if (volunteerCount) formData.append('volunteer_count', volunteerCount);
      if (notes) formData.append('notes', notes);

      const res = await fetch(`/api/cleanups/${id}/complete`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('complete');
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'scheduled': return 'Scheduled';
      case 'forming': return 'Forming';
      case 'in_progress': return 'In progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return s;
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

  if (!cleanup) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <p className="text-weathered">Pick not found</p>
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
          {step === 'info' && (
            <>
              {/* Status and title */}
              <div>
                <Badge className="bg-brand-50 text-brand-600 mb-2">
                  {statusLabel(cleanup.status)}
                </Badge>
                <h1 className="text-2xl font-bold text-loam">
                  {hotspot?.area_name || 'Litter Pick'}
                </h1>
                {cleanup.proposed_time && (
                  <p className="text-sm text-brand-500 font-medium mt-1">
                    <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {new Date(cleanup.proposed_time).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                <div className="mt-2">
                  <ShareButton
                    url={`https://litter-pick.com/pick/${id}`}
                    title={`Litter Pick ${hotspot?.area_name || ''}`}
                    text={`Join the litter pick at ${hotspot?.area_name || 'this location'}. Help clean up your community.`}
                  />
                </div>
              </div>

              {/* Map */}
              {hotspot && (
                <div className="space-y-2">
                  <PickMap lat={hotspot.centroid_latitude} lng={hotspot.centroid_longitude} />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-400 font-mono">
                      {hotspot.centroid_latitude.toFixed(5)}, {hotspot.centroid_longitude.toFixed(5)}
                    </p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hotspot.centroid_latitude},${hotspot.centroid_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      </svg>
                      Get directions
                    </a>
                  </div>
                </div>
              )}

              {/* Stats */}
              <Card>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-loam">{cleanup.volunteer_count}</p>
                    <p className="text-xs text-weathered">Volunteers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-loam">{cleanup.bags_collected ?? '\u2014'}</p>
                    <p className="text-xs text-weathered">Bags collected</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-loam">{hotspot?.report_count ?? '\u2014'}</p>
                    <p className="text-xs text-weathered">Reports</p>
                  </div>
                </div>
              </Card>

              {/* Organiser */}
              {organiser && (
                <Card>
                  <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">Organised by</h3>
                  <div className="flex items-center gap-3">
                    {organiser.avatar_url ? (
                      <img
                        src={organiser.avatar_url}
                        alt={organiser.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-500">
                          {organiser.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-loam">{organiser.first_name}</p>
                  </div>
                </Card>
              )}

              {/* Council collection */}
              {hotspot && (
                <CouncilSection
                  cleanup={cleanup}
                  hotspot={hotspot}
                  isOrganiser={!!currentUserId && currentUserId === organiser?.id}
                />
              )}

              {/* Volunteers */}
              {volunteers.length > 0 && (
                <Card>
                  <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">
                    Who&apos;s joining ({volunteers.length})
                  </h3>
                  <div className="space-y-3">
                    {volunteers.map((v) => (
                      <div key={v.id} className="flex gap-3">
                        {v.avatar_url ? (
                          <img
                            src={v.avatar_url}
                            alt={v.first_name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-stone-400">
                              {v.first_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-loam">{v.first_name}</p>
                            {v.interest_type === 'organise' && (
                              <span className="text-[11px] text-brand-500 font-medium">Organiser</span>
                            )}
                          </div>
                          <EquipmentIcons equipment={{
                            equipment_bags: v.equipment_bags,
                            equipment_bag_hoop: v.equipment_bag_hoop,
                            equipment_gloves: v.equipment_gloves,
                            equipment_litter_picker: v.equipment_litter_picker,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Equipment overview */}
              {volunteers.length > 0 && (
                <Card>
                  <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-3">
                    Equipment
                  </h3>
                  <EquipmentSummary volunteers={volunteers} />
                </Card>
              )}

              {/* Notes */}
              {cleanup.notes && (
                <Card>
                  <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide mb-2">Notes</h3>
                  <p className="text-sm text-loam">{cleanup.notes}</p>
                </Card>
              )}

              {/* Q&A Section */}
              <QASection
                cleanupId={id}
                questions={questions}
                currentUserId={currentUserId}
                isOrganiser={!!currentUserId && currentUserId === organiser?.id}
                isParticipant={!!currentUserId && volunteers.some((v) => v.id === currentUserId)}
                onQuestionsUpdate={setQuestions}
              />

              {/* Action buttons */}
              {cleanup.status !== 'completed' && (
                <Button fullWidth onClick={() => setStep('complete')}>
                  Log the pick
                </Button>
              )}

              {hotspot && (
                <a href={`/hotspot/${hotspot.id}`}>
                  <Button fullWidth variant="ghost">View hotspot</Button>
                </a>
              )}
            </>
          )}

          {step === 'complete' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-loam">Show the difference</h1>
                <p className="text-sm text-weathered mt-1">
                  Upload an after photo so everyone can see the improvement
                </p>
              </div>

              <PhotoCapture onPhotoSelected={handlePhoto} preview={photoPreview} />

              <Select
                id="completionStatus"
                label="How does it look now?"
                value={completionStatus}
                onChange={(e) => setCompletionStatus(e.target.value)}
                options={[
                  { value: 'improved', label: 'Improved' },
                  { value: 'mostly_cleared', label: 'Mostly cleared' },
                  { value: 'fully_cleaned', label: 'Fully cleared' },
                ]}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="bags"
                  label="Bags collected"
                  type="number"
                  placeholder="e.g. 5"
                  value={bagsCollected}
                  onChange={(e) => setBagsCollected(e.target.value)}
                />
                <Input
                  id="volunteers"
                  label="Volunteers"
                  type="number"
                  placeholder="e.g. 3"
                  value={volunteerCount}
                  onChange={(e) => setVolunteerCount(e.target.value)}
                />
              </div>

              <Textarea
                id="notes"
                label="Notes (optional)"
                placeholder="How did it go?"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep('info')}>Back</Button>
                <Button fullWidth onClick={handleComplete}>Submit</Button>
              </div>
            </>
          )}

          {step === 'submitting' && (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-weathered mt-4">Submitting...</p>
            </div>
          )}

          {step === 'success' && (
            <Card className="text-center py-8">
              <h2 className="text-2xl font-bold text-loam">That&apos;s logged. Well done.</h2>
              <p className="text-sm text-weathered mt-3 max-w-xs mx-auto leading-relaxed">
                The area has been updated to show the improvement.
              </p>
              <div className="mt-6 space-y-3">
                <a href="/map" className="block">
                  <Button fullWidth>Back to map</Button>
                </a>
                <a href="/profile" className="block">
                  <Button fullWidth variant="outline">View your profile</Button>
                </a>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
