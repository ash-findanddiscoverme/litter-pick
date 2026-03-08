import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { hotspotStatusLabel, hotspotStatusColor, formatDate } from '@/lib/utils';
import type { Hotspot } from '@/types/database';

interface HotspotCardProps {
  hotspot: Hotspot;
}

export default function HotspotCard({ hotspot }: HotspotCardProps) {
  return (
    <Link href={`/hotspot/${hotspot.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Image thumbnail */}
          {hotspot.latest_before_image_url ? (
            <img
              src={hotspot.latest_before_image_url}
              alt="Litter hotspot"
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={hotspotStatusColor(hotspot.status)}>
                {hotspotStatusLabel(hotspot.status)}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-loam truncate">
              {hotspot.area_name || 'Hotspot area'}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-weathered">
              <span>{hotspot.report_count} reports</span>
              <span>{hotspot.volunteer_interest_count} interested</span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              Updated {formatDate(hotspot.updated_at)}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
