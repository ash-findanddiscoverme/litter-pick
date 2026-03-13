'use client';

const LOCATION_COOKIE_NAME = 'lp_user_location';
const LOCATION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface StoredLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

export function getStoredLocation(): StoredLocation | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LOCATION_COOKIE_NAME && value) {
      try {
        const decoded = decodeURIComponent(value);
        const parsed = JSON.parse(decoded) as StoredLocation;
        if (parsed.lat && parsed.lng) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function setStoredLocation(lat: number, lng: number): void {
  if (typeof document === 'undefined') return;

  const data: StoredLocation = {
    lat,
    lng,
    timestamp: Date.now(),
  };

  const encoded = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${LOCATION_COOKIE_NAME}=${encoded}; max-age=${LOCATION_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export async function requestUserLocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setStoredLocation(lat, lng);
        resolve({ lat, lng });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
