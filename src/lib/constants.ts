// Oxfordshire centre coordinates
export const DEFAULT_CENTER: [number, number] = [-1.2577, 51.7520]; // [lng, lat]
export const DEFAULT_ZOOM = 9;

// Hotspot configuration
export const HOTSPOT_RADIUS_KM = 0.3; // 300m radius for clustering reports
export const HOTSPOT_MIN_REPORTS = 1; // Minimum reports to form a hotspot
export const HOTSPOT_VOLUNTEER_THRESHOLD = 3; // Volunteers needed to trigger "cleanup forming"
export const REPORT_RECENCY_DAYS = 30; // Reports within this window count toward hotspots

// Severity weights for hotspot scoring
export const SEVERITY_WEIGHTS: Record<string, number> = {
  low: 1,
  medium: 2,
  bad: 3,
};

// Image compression
export const MAX_IMAGE_SIZE_MB = 2;
export const MAX_IMAGE_WIDTH = 1920;

// Map tile style URL (MapTiler)
export const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=`;
