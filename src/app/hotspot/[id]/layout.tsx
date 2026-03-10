import type { Metadata } from 'next';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createServiceRoleClient();
    const { data: hotspot } = await supabase
      .from('hotspots')
      .select('area_name, centroid_latitude, centroid_longitude')
      .eq('id', params.id)
      .single();

    if (!hotspot) {
      return {};
    }

    const name = hotspot.area_name || 'Litter hotspot';
    const coords = `${hotspot.centroid_latitude.toFixed(5)}, ${hotspot.centroid_longitude.toFixed(5)}`;
    const title = `${name} - Litter Hotspot | Litter Pick`;
    const description = `Join a litter pick at ${name} (${coords}). Help clear the area, team up with locals, and make your community cleaner.`;
    const url = `https://litter-pick.com/hotspot/${params.id}`;

    return {
      title,
      description,
      openGraph: {
        siteName: 'Litter Pick',
        type: 'website',
        title,
        description,
        url,
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch {
    return {};
  }
}

export default function HotspotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
