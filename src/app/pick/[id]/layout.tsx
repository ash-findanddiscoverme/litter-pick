import type { Metadata } from 'next';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface Props {
  params: { id: string };
}

function formatPickDate(dateStr: string): string {
  const d = new Date(dateStr);
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'long' });
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const h12 = hours % 12 || 12;
  return `${weekday} ${day} ${month} ${year}, ${h12}:${minutes}${ampm}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createServiceRoleClient();

    const { data: cleanup } = await supabase
      .from('cleanups')
      .select('hotspot_id, proposed_time, volunteer_count')
      .eq('id', params.id)
      .single();

    if (!cleanup) {
      return {};
    }

    const { data: hotspot } = await supabase
      .from('hotspots')
      .select('area_name, centroid_latitude, centroid_longitude')
      .eq('id', cleanup.hotspot_id)
      .single();

    const name = hotspot?.area_name || 'Litter hotspot';
    const dateStr = cleanup.proposed_time ? formatPickDate(cleanup.proposed_time) : '';
    const volunteerCount = cleanup.volunteer_count || 0;

    const title = dateStr
      ? `Litter Pick ${name} | ${dateStr}`
      : `Litter Pick ${name}`;

    const description = dateStr
      ? `Join the litter pick at ${name} on ${dateStr}. ${volunteerCount} volunteer${volunteerCount !== 1 ? 's' : ''} signed up. Help clean up your community.`
      : `Join the litter pick at ${name}. ${volunteerCount} volunteer${volunteerCount !== 1 ? 's' : ''} signed up. Help clean up your community.`;

    const url = `https://litter-pick.com/pick/${params.id}`;

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

export default function PickLayout({ children }: { children: React.ReactNode }) {
  return children;
}
