'use client';

import imageCompression from 'browser-image-compression';
import { MAX_IMAGE_SIZE_MB, MAX_IMAGE_WIDTH } from './constants';

/** Compress an image file before upload */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: MAX_IMAGE_SIZE_MB,
    maxWidthOrHeight: MAX_IMAGE_WIDTH,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch {
    // If compression fails, return original
    return file;
  }
}

/** Extract EXIF GPS coordinates from an image file if available */
export async function extractGPSFromImage(
  file: File
): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target?.result as ArrayBuffer);
        // Quick EXIF check — look for JPEG SOI marker
        if (view.getUint16(0) !== 0xFFD8) {
          resolve(null);
          return;
        }

        let offset = 2;
        while (offset < view.byteLength - 2) {
          const marker = view.getUint16(offset);
          if (marker === 0xFFE1) {
            // APP1 — EXIF data
            const exifData = parseExifGPS(view, offset + 4);
            resolve(exifData);
            return;
          }
          offset += 2 + view.getUint16(offset + 2);
        }
        resolve(null);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Only read first 128KB
  });
}

function parseExifGPS(
  _view: DataView,
  _offset: number
): { latitude: number; longitude: number } | null {
  // Simplified — full EXIF GPS parsing is complex.
  // For MVP, we rely primarily on browser geolocation.
  // This is a stub for future enhancement.
  return null;
}

/** Get current position via browser Geolocation API */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}
