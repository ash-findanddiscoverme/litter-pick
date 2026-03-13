import { MetadataRoute } from 'next';
import { createServiceRoleClient } from '@/lib/supabase/server';

const BASE_URL = 'https://litter-pick.com';

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceRoleClient();

  // Static pages with their priorities and change frequencies
  const staticPages: SitemapEntry[] = [
    { url: '', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: '/picks', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: '/map', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: '/report', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: '/volunteer', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: '/donate', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: '/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: '/guides', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: '/guides/your-first-litter-pick', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: '/guides/organise-a-litter-pick', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: '/guides/litter-on-our-roads', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: '/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: '/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: '/cookies', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: '/community-guidelines', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Fetch all active hotspots for dynamic pages
  const { data: hotspots } = await supabase
    .from('hotspots')
    .select('id, updated_at')
    .in('status', ['needs_attention', 'cleanup_forming', 'cleanup_scheduled']);

  const hotspotPages: SitemapEntry[] = (hotspots || []).map((hotspot) => ({
    url: `/hotspot/${hotspot.id}`,
    lastModified: new Date(hotspot.updated_at || Date.now()),
    changeFrequency: 'daily' as ChangeFrequency,
    priority: 0.7,
  }));

  // Fetch all upcoming scheduled picks (cleanups)
  const { data: picks } = await supabase
    .from('cleanups')
    .select('id, proposed_time, updated_at')
    .eq('status', 'scheduled')
    .not('proposed_time', 'is', null)
    .gte('proposed_time', new Date().toISOString());

  const pickPages: SitemapEntry[] = (picks || []).map((pick) => ({
    url: `/pick/${pick.id}`,
    lastModified: new Date(pick.updated_at || pick.proposed_time || Date.now()),
    changeFrequency: 'daily' as ChangeFrequency,
    priority: 0.8,
  }));

  // Combine all entries
  const allPages = [...staticPages, ...hotspotPages, ...pickPages];

  return allPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
