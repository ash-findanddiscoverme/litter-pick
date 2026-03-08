import { type HotspotStatus } from '@/types/database';

/** Merge classnames (simple version — no clsx dependency needed) */
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/** Format a date string into a friendly relative or short format */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Human-readable hotspot status */
export function hotspotStatusLabel(status: HotspotStatus): string {
  const labels: Record<HotspotStatus, string> = {
    needs_attention: 'Needs attention',
    cleanup_forming: 'Cleanup forming',
    recently_improved: 'Recently improved',
    cleaned: 'Cleared',
  };
  return labels[status];
}

/** Status colour for badges — warm, brand-aligned tones */
export function hotspotStatusColor(status: HotspotStatus): string {
  const colors: Record<HotspotStatus, string> = {
    needs_attention: 'bg-accent-100 text-accent-600',
    cleanup_forming: 'bg-amber-100 text-amber-800',
    recently_improved: 'bg-brand-50 text-brand-500',
    cleaned: 'bg-brand-100 text-brand-600',
  };
  return colors[status];
}

/** Severity label */
export function severityLabel(severity: string): string {
  return severity === 'bad' ? 'Bad' : severity.charAt(0).toUpperCase() + severity.slice(1);
}

/** Severity colour — warm tones instead of traffic-light */
export function severityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'bg-stone-100 text-stone-400',
    medium: 'bg-accent-100 text-accent-600',
    bad: 'bg-red-100 text-red-700',
  };
  return colors[severity] || 'bg-stone-100 text-stone-400';
}

/** Compute distance between two lat/lng pairs in km (Haversine) */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}
