'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface AdminImage {
  id: string;
  image_url: string;
  source: string;
  source_id: string;
  uploaded_at: string;
  user_id: string | null;
  meta: Record<string, string | null>;
}

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  report: { label: 'Report', className: 'bg-blue-50 text-blue-700' },
  avatar: { label: 'Avatar', className: 'bg-purple-50 text-purple-700' },
  cleanup: { label: 'Cleanup', className: 'bg-green-50 text-green-700' },
};

export default function AdminImagesPage() {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get('source');

  const [images, setImages] = useState<AdminImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>(sourceParam || 'all');
  const [deleteConfirm, setDeleteConfirm] = useState<AdminImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState<AdminImage | null>(null);

  async function loadImages() {
    try {
      const res = await fetch('/api/admin/images');
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: deleteConfirm.id,
          image_url: deleteConfirm.image_url,
          source: deleteConfirm.source,
          source_id: deleteConfirm.source_id,
        }),
      });
      if (res.ok) {
        setImages((prev) => prev.filter((i) => i.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  const filtered = sourceFilter === 'all' ? images : images.filter((i) => i.source === sourceFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-loam mb-6">Images</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'report', 'avatar', 'cleanup'].map((f) => (
          <button
            key={f}
            onClick={() => setSourceFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sourceFilter === f
                ? 'bg-brand-500 text-white'
                : 'bg-stone-100 text-weathered hover:bg-stone-200'
            }`}
          >
            {f === 'all' ? `All (${images.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${images.filter((i) => i.source === f).length})`}
          </button>
        ))}
      </div>

      <p className="text-sm text-weathered mb-4">{filtered.length} image{filtered.length !== 1 ? 's' : ''}</p>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((img) => {
          const badge = SOURCE_BADGE[img.source] || SOURCE_BADGE.report;
          return (
            <div key={img.id} className="group relative bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
              <button
                onClick={() => setLightbox(img)}
                className="w-full aspect-square"
              >
                <img
                  src={img.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
              <div className="p-2">
                <div className="flex items-center justify-between gap-1">
                  <Badge className={badge.className}>{badge.label}</Badge>
                  <span className="text-[10px] text-weathered">
                    {new Date(img.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {img.meta?.user_name && (
                  <p className="text-[11px] text-weathered mt-1 truncate">{img.meta.user_name}</p>
                )}
                {img.meta?.severity && (
                  <p className="text-[11px] text-weathered mt-1">Severity: {img.meta.severity}</p>
                )}
              </div>
              {/* Delete button on hover */}
              <button
                onClick={() => setDeleteConfirm(img)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                title="Delete image"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-weathered py-12">No images found.</p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt=""
              className="w-full h-full object-contain rounded-xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={(SOURCE_BADGE[lightbox.source] || SOURCE_BADGE.report).className}>
                    {(SOURCE_BADGE[lightbox.source] || SOURCE_BADGE.report).label}
                  </Badge>
                  <p className="text-white text-xs mt-1">
                    Uploaded {new Date(lightbox.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => { setDeleteConfirm(lightbox); setLightbox(null); }}
                >
                  Delete
                </Button>
              </div>
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-loam mb-2">Delete image</h2>
            <p className="text-sm text-weathered mb-1">
              Are you sure you want to permanently delete this {deleteConfirm.source} image?
            </p>
            <p className="text-xs text-red-500 mb-4">This action cannot be undone.</p>
            <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-stone-100">
              <img src={deleteConfirm.image_url} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
