'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import VolunteerInterestButton from '@/components/hotspot/VolunteerInterestButton';
import ShareButton from '@/components/ui/ShareButton';
import { hotspotStatusLabel, hotspotStatusColor, formatDate, formatPickDate } from '@/lib/utils';
import type { Hotspot, Cleanup } from '@/types/database';

interface ReportPhoto {
  id: string;
  image_url: string;
  severity: string;
  submitted_at: string;
}

export const runtime = 'edge';

export default function HotspotDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [cleanup, setCleanup] = useState<Cleanup | null>(null);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/hotspots/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setHotspot(data.hotspot || null);
        setCleanup(data.cleanup || null);
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Check admin status
    fetch('/api/admin/check')
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => {});
  }, [id]);

  // Dynamic page title and meta description
  useEffect(() => {
    if (!hotspot) return;
    const name = hotspot.area_name || 'Litter hotspot';
    const coords = `${hotspot.centroid_latitude.toFixed(5)}, ${hotspot.centroid_longitude.toFixed(5)}`;

    document.title = `${name} - Litter Hotspot`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', `Join a litter pick at ${name} (${coords}). Help clear the area, team up with locals, and make your community cleaner.`);
  }, [hotspot]);

  const handleRename = async () => {
    if (!nameInput.trim() || !hotspot) return;
    setSavingName(true);
    try {
      const res = await fetch(`/api/hotspots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_name: nameInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setHotspot({ ...hotspot, area_name: data.area_name });
        setEditingName(false);
      }
    } catch {
      // ignore
    } finally {
      setSavingName(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    setDeletingPhotoId(photoId);
    try {
      const res = await fetch(`/api/admin/reports/${photoId}`, { method: 'DELETE' });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        if (lightboxIdx !== null) {
          setLightboxIdx(null);
        }
        if (hotspot) {
          setHotspot({ ...hotspot, report_count: Math.max(0, hotspot.report_count - 1) });
        }
      }
    } catch {
      // ignore
    } finally {
      setDeletingPhotoId(null);
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
            {editingName ? (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-lg font-bold text-loam border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
                />
                <button
                  onClick={handleRename}
                  disabled={savingName}
                  className="px-3 py-1.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50"
                >
                  {savingName ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-3 py-1.5 bg-stone-100 text-stone-500 text-sm font-medium rounded-lg hover:bg-stone-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <h1 className="text-2xl font-bold text-loam">
                  {hotspot.area_name || 'Litter hotspot'}
                </h1>
                {isAdmin && (
                  <button
                    onClick={() => { setNameInput(hotspot.area_name || ''); setEditingName(true); }}
                    className="text-stone-300 hover:text-brand-500 transition-colors"
                    title="Edit name"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <p className="text-sm text-weathered mt-1">
              {hotspot.report_count} reports · Score: {hotspot.score} · Updated {formatDate(hotspot.updated_at)}
            </p>
            <p className="text-xs text-stone-400 mt-1 font-mono">
              {hotspot.centroid_latitude.toFixed(5)}, {hotspot.centroid_longitude.toFixed(5)}
            </p>
            <div className="mt-2">
              <ShareButton
                url={`https://litter-pick.com/hotspot/${id}`}
                title={`${hotspot.area_name || 'Litter hotspot'} - Litter Hotspot`}
                text={`Join a litter pick at ${hotspot.area_name || 'this hotspot'}. Help clear the area, team up with locals, and make your community cleaner.`}
              />
            </div>
          </div>

          {/* Report photo gallery */}
          {photos.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-loam">Reported photos</h3>
                <span className="text-xs text-stone-400">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-square group">
                    <button
                      onClick={() => setLightboxIdx(idx)}
                      className="w-full h-full focus:outline-none"
                    >
                      <img
                        src={photo.image_url}
                        alt={`Report — ${photo.severity}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                        <div className="w-full px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            photo.severity === 'bad'
                              ? 'bg-red-500 text-white'
                              : photo.severity === 'medium'
                              ? 'bg-amber-400 text-amber-900'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {photo.severity}
                          </span>
                        </div>
                      </div>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={deletingPhotoId === photo.id}
                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Delete photo"
                      >
                        {deletingPhotoId === photo.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* After image if available */}
              {hotspot.latest_after_image_url && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-weathered mb-1.5">After pick</p>
                  <img
                    src={hotspot.latest_after_image_url}
                    alt="After cleanup"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                </div>
              )}
            </div>
          ) : (
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
          )}

          {/* Lightbox */}
          {lightboxIdx !== null && photos[lightboxIdx] && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              onClick={() => setLightboxIdx(null)}
            >
              <button
                onClick={() => setLightboxIdx(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Previous */}
              {lightboxIdx > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}

              {/* Image */}
              <img
                src={photos[lightboxIdx].image_url}
                alt={`Report — ${photos[lightboxIdx].severity}`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Next */}
              {lightboxIdx < photos.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}

              {/* Info bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  photos[lightboxIdx].severity === 'bad'
                    ? 'bg-red-500 text-white'
                    : photos[lightboxIdx].severity === 'medium'
                    ? 'bg-amber-400 text-amber-900'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {photos[lightboxIdx].severity}
                </span>
                <span className="text-xs text-white/70">
                  {formatDate(photos[lightboxIdx].submitted_at)}
                </span>
                <span className="text-xs text-white/50">
                  {lightboxIdx + 1} / {photos.length}
                </span>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photos[lightboxIdx].id); }}
                    className="text-red-400 hover:text-red-300 transition-colors ml-1"
                    title="Delete photo"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

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

          {/* Pick info */}
          {cleanup && (
            <Card>
              <h3 className="text-sm font-semibold text-loam mb-2">Pick planned</h3>
              <p className="text-sm text-weathered">
                Status: {cleanup.status}
                {cleanup.proposed_time && ` · ${new Date(cleanup.proposed_time).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}
              </p>
              {cleanup.status === 'scheduled' || cleanup.status === 'in_progress' ? (
                <a href={`/pick/${cleanup.id}`} className="block mt-3">
                  <Button size="sm" fullWidth>View pick details</Button>
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
            <a href={`/picks/new?hotspot_id=${hotspot.id}`} className="block mt-4">
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
            <a href={`/pick/${cleanup.id}`} className="block">
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <h3 className="text-sm font-semibold text-loam">Pick scheduled</h3>
                  <svg className="w-4 h-4 text-stone-300 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <p className="text-sm text-brand-500 font-medium">{formatPickDate(cleanup.proposed_time)}</p>
                <p className="text-xs text-stone-400 mt-1">{cleanup.volunteer_count} {cleanup.volunteer_count === 1 ? 'person' : 'people'} joining</p>
              </Card>
            </a>
          )}

          {/* Completion link */}
          {(hotspot.status === 'cleanup_forming' || hotspot.status === 'needs_attention') && cleanup && (
            <a href={`/pick/${cleanup.id}`}>
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
