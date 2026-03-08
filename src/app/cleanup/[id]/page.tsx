'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
import type { Cleanup, Hotspot } from '@/types/database';

type Step = 'info' | 'complete' | 'submitting' | 'success';

export default function CleanupPage() {
  const params = useParams();
  const id = params.id as string;
  const [cleanup, setCleanup] = useState<Cleanup | null>(null);
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('info');

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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
          <p className="text-weathered">Clean-up not found</p>
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
              <div>
                <Badge className="bg-brand-50 text-brand-600 mb-2">
                  {cleanup.status}
                </Badge>
                <h1 className="text-2xl font-bold text-loam">
                  {hotspot?.area_name || 'Clean-up'}
                </h1>
                {cleanup.proposed_time && (
                  <p className="text-sm text-weathered mt-1">
                    Planned for {new Date(cleanup.proposed_time).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>

              <Card>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-loam">{cleanup.volunteer_count}</p>
                    <p className="text-xs text-weathered">Volunteers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-loam">{cleanup.bags_collected ?? '\u2014'}</p>
                    <p className="text-xs text-weathered">Bags collected</p>
                  </div>
                </div>
              </Card>

              {cleanup.status !== 'completed' && (
                <Button fullWidth onClick={() => setStep('complete')}>
                  Log the clean-up
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
