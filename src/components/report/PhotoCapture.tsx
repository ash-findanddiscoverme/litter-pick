'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  onPhotoSelected: (file: File) => void;
  preview?: string | null;
  className?: string;
}

export default function PhotoCapture({ onPhotoSelected, preview, className }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onPhotoSelected(file);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Camera input — forces camera on mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {/* Gallery input — no capture attr, opens photo library */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Captured litter"
            className="w-full h-48 object-cover rounded-2xl border border-stone-200"
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-medium text-loam shadow-sm hover:bg-white transition-colors"
            >
              Retake
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-medium text-loam shadow-sm hover:bg-white transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={cn(
            'w-full rounded-2xl border-2 border-dashed transition-all p-5',
            dragOver
              ? 'border-brand-400 bg-brand-50'
              : 'border-stone-200 bg-stone-50'
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-loam text-center">Add a photo of the litter</p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Take photo
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-loam rounded-xl text-sm font-semibold border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                Upload photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
