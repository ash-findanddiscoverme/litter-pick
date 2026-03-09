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
        const buffer = e.target?.result as ArrayBuffer;
        const view = new DataView(buffer);

        // Check JPEG SOI marker
        if (view.getUint16(0) !== 0xFFD8) {
          resolve(null);
          return;
        }

        // Find APP1 (EXIF) segment
        let offset = 2;
        while (offset < view.byteLength - 4) {
          const marker = view.getUint16(offset);
          if (marker === 0xFFE1) {
            const result = parseExifGPS(view, offset + 4);
            resolve(result);
            return;
          }
          // Skip to next marker
          const segLen = view.getUint16(offset + 2);
          offset += 2 + segLen;
        }
        resolve(null);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    // EXIF data is typically in the first 256KB
    reader.readAsArrayBuffer(file.slice(0, 256 * 1024));
  });
}

function parseExifGPS(
  view: DataView,
  start: number
): { latitude: number; longitude: number } | null {
  try {
    // Check for "Exif\0\0"
    if (
      view.getUint8(start) !== 0x45 || // E
      view.getUint8(start + 1) !== 0x78 || // x
      view.getUint8(start + 2) !== 0x69 || // i
      view.getUint8(start + 3) !== 0x66 // f
    ) {
      return null;
    }

    const tiffStart = start + 6;
    // Determine byte order: II (little-endian) or MM (big-endian)
    const byteOrder = view.getUint16(tiffStart);
    const littleEndian = byteOrder === 0x4949;

    // Read offset to first IFD
    const ifd0Offset = view.getUint32(tiffStart + 4, littleEndian);
    const ifd0Start = tiffStart + ifd0Offset;

    // Search IFD0 for GPS IFD pointer (tag 0x8825)
    const entryCount = view.getUint16(ifd0Start, littleEndian);
    let gpsIFDOffset: number | null = null;

    for (let i = 0; i < entryCount; i++) {
      const entryStart = ifd0Start + 2 + i * 12;
      const tag = view.getUint16(entryStart, littleEndian);
      if (tag === 0x8825) {
        gpsIFDOffset = view.getUint32(entryStart + 8, littleEndian);
        break;
      }
    }

    if (gpsIFDOffset === null) return null;

    const gpsStart = tiffStart + gpsIFDOffset;
    const gpsEntryCount = view.getUint16(gpsStart, littleEndian);

    let latRef = 'N';
    let lonRef = 'E';
    let latValues: number[] | null = null;
    let lonValues: number[] | null = null;

    for (let i = 0; i < gpsEntryCount; i++) {
      const entryStart = gpsStart + 2 + i * 12;
      const tag = view.getUint16(entryStart, littleEndian);

      switch (tag) {
        case 0x0001: // GPSLatitudeRef
          latRef = String.fromCharCode(view.getUint8(entryStart + 8));
          break;
        case 0x0002: // GPSLatitude
          latValues = readRational3(view, tiffStart + view.getUint32(entryStart + 8, littleEndian), littleEndian);
          break;
        case 0x0003: // GPSLongitudeRef
          lonRef = String.fromCharCode(view.getUint8(entryStart + 8));
          break;
        case 0x0004: // GPSLongitude
          lonValues = readRational3(view, tiffStart + view.getUint32(entryStart + 8, littleEndian), littleEndian);
          break;
      }
    }

    if (!latValues || !lonValues) return null;

    let latitude = latValues[0] + latValues[1] / 60 + latValues[2] / 3600;
    let longitude = lonValues[0] + lonValues[1] / 60 + lonValues[2] / 3600;

    if (latRef === 'S') latitude = -latitude;
    if (lonRef === 'W') longitude = -longitude;

    // Sanity check
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
    if (latitude === 0 && longitude === 0) return null;

    return { latitude, longitude };
  } catch {
    return null;
  }
}

/** Read 3 consecutive RATIONAL values (each = uint32 numerator / uint32 denominator) */
function readRational3(view: DataView, offset: number, littleEndian: boolean): number[] {
  const values: number[] = [];
  for (let i = 0; i < 3; i++) {
    const num = view.getUint32(offset + i * 8, littleEndian);
    const den = view.getUint32(offset + i * 8 + 4, littleEndian);
    values.push(den === 0 ? 0 : num / den);
  }
  return values;
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
