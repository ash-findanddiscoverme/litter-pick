'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeatMap from '@/components/map/HeatMap';
import PhotoCapture from '@/components/report/PhotoCapture';
import SeverityPicker from '@/components/report/SeverityPicker';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { compressImage, getCurrentPosition, extractGPSFromImage } from '@/lib/image';
import type { ReportSeverity } from '@/types/database';

type Step = 'photo' | 'location' | 'details' | 'submitting' | 'success';

export default function ReportPage() {
  const [step, setStep] = useState<Step>('photo');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [severity, setSeverity] = useState<ReportSeverity>('medium');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationSource, setLocationSource] = useState<'exif' | 'gps' | 'manual' | null>(null);

  const handlePhoto = useCallback(async (file: File) => {
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));

    setLocating(true);

    // 1. Try to extract GPS from the photo's EXIF metadata
    const exifGPS = await extractGPSFromImage(file);
    if (exifGPS) {
      setLatitude(exifGPS.latitude);
      setLongitude(exifGPS.longitude);
      setLocationSource('exif');
      setLocating(false);
      setStep('location');
      return;
    }

    // 2. Fall back to browser geolocation
    try {
      const pos = await getCurrentPosition();
      setLatitude(pos.coords.latitude);
      setLongitude(pos.coords.longitude);
      setLocationSource('gps');
    } catch {
      setLocationSource('manual');
    }
    setLocating(false);
    setStep('location');
  }, []);

  const handleLocationSelect = useCallback((lng: number, lat: number) => {
    setLongitude(lng);
    setLatitude(lat);
  }, []);

  const handleSubmit = async () => {
    if (!latitude || !longitude) {
      setError('Please set a location on the map');
      return;
    }

    setStep('submitting');
    setError('');

    try {
      const formData = new FormData();
      if (photo) formData.append('image', photo);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('severity', severity);
      if (note) formData.append('note', note);

      const res = await fetch('/api/reports', { method: 'POST', body: formData });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('details');
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Progress indicator */}
          {step !== 'success' && step !== 'submitting' && (
            <div className="flex items-center gap-2 mb-6">
              {['photo', 'location', 'details'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`h-1.5 rounded-full flex-1 transition-colors ${
                      ['photo', 'location', 'details'].indexOf(step) >= i
                        ? 'bg-brand-500'
                        : 'bg-stone-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Photo */}
          {step === 'photo' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-loam">Report litter</h1>
                <p className="text-sm text-weathered mt-1">
                  A quick photo helps identify the area
                </p>
              </div>
              <PhotoCapture onPhotoSelected={handlePhoto} preview={photoPreview} />
              <Button variant="ghost" size="sm" onClick={() => { setStep('location'); }}>
                Skip photo
              </Button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 'location' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-loam">Where is it?</h1>
                <p className="text-sm text-weathered mt-1">
                  {locating
                    ? 'Getting your location...'
                    : locationSource === 'exif'
                    ? 'Location found from your photo — confirm or adjust the pin'
                    : 'Confirm or adjust the pin on the map'}
                </p>
                {locationSource === 'exif' && (
                  <span className="inline-flex items-center gap-1 mt-2 bg-brand-50 text-brand-600 rounded-full px-3 py-1 text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    From photo metadata
                  </span>
                )}
              </div>

              <HeatMap
                pickMode
                initialCenter={longitude && latitude ? [longitude, latitude] : undefined}
                initialZoom={15}
                onLocationSelect={handleLocationSelect}
                className="h-64"
              />

              {latitude && longitude && (
                <p className="text-xs text-stone-300 text-center">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep('photo')}>
                  Back
                </Button>
                <Button fullWidth onClick={() => setStep('details')}>
                  Confirm location
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-loam">A few details</h1>
                <p className="text-sm text-weathered mt-1">Almost done</p>
              </div>

              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Captured"
                  className="w-full h-32 object-cover rounded-xl"
                />
              )}

              <SeverityPicker value={severity} onChange={setSeverity} />

              <Textarea
                id="note"
                label="Anything to add? (optional)"
                placeholder="e.g. Under the bridge, mostly fast food packaging"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep('location')}>
                  Back
                </Button>
                <Button fullWidth onClick={handleSubmit}>
                  Submit report
                </Button>
              </div>
            </div>
          )}

          {/* Submitting */}
          {step === 'submitting' && (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-weathered mt-4">Submitting your report...</p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <Card className="text-center py-8">
              <h2 className="text-2xl font-bold text-loam">That&apos;s logged. Thanks for reporting.</h2>
              <p className="text-sm text-weathered mt-3 max-w-xs mx-auto leading-relaxed">
                Your report helps build a clearer picture of litter hotspots in the area.
              </p>
              <div className="mt-6 space-y-3">
                <a href="/volunteer" className="block">
                  <Button fullWidth variant="primary">
                    Help clean up — volunteer
                  </Button>
                </a>
                <a href="/map" className="block">
                  <Button fullWidth variant="outline">
                    View the map
                  </Button>
                </a>
                <button
                  onClick={() => {
                    setStep('photo');
                    setPhoto(null);
                    setPhotoPreview(null);
                    setLatitude(null);
                    setLongitude(null);
                    setSeverity('medium');
                    setNote('');
                  }}
                  className="text-sm text-brand-500 font-medium hover:underline"
                >
                  Report another
                </button>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
