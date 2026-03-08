'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  onPhotoSelected: (file: File) => void;
  preview?: string | null;
  className?: string;
}

export default function PhotoCapture({ onPhotoSelected, preview, className }: PhotoCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onPhotoSelected(file);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
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
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-medium text-loam shadow-sm hover:bg-white transition-colors"
          >
            Change photo
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={cn(
            'w-full h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3',
            dragOver
              ? 'border-brand-400 bg-brand-50'
              : 'border-stone-200 bg-stone-50 hover:border-brand-300 hover:bg-brand-50/50'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-loam">Take or upload a photo</p>
            <p className="text-xs text-weathered mt-0.5">Tap to use your camera</p>
          </div>
        </button>
      )}
    </div>
  );
}
