import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { hotspotStatusLabel, hotspotStatusColor, formatDate } from '@/lib/utils';
import type { Hotspot } from '@/types/database';

interface HotspotCardProps {
  hotspot: Hotspot;
  distanceKm?: number | null;
}

export default function HotspotCard({ hotspot, distanceKm }: HotspotCardProps) {
  return (
    <Link href={`/hotspot/${hotspot.id}`}>
      <Card hover variant="elevated">
        <div className="flex items-start gap-4">
          {/* Image thumbnail */}
          {hotspot.latest_before_image_url ? (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 group">
              <img
                src={hotspot.latest_before_image_url}
                alt="Litter hotspot"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={hotspotStatusColor(hotspot.status)}>
                {hotspotStatusLabel(hotspot.status)}
              </Badge>
              {distanceKm != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-xs font-medium rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
                </span>
              )}
            </div>
            <h3 className="font-display text-base font-semibold text-loam truncate">
              {hotspot.area_name || 'Hotspot area'}
            </h3>
            {hotspot.county && (
              <p className="text-sm text-weathered truncate mt-0.5">{hotspot.county}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-weathered">
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                </svg>
                <span className="font-medium text-loam">{hotspot.report_count}</span> reports
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-weathered">
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span className="font-medium text-loam">{hotspot.volunteer_interest_count}</span> interested
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-2">
              Updated {formatDate(hotspot.updated_at)}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
