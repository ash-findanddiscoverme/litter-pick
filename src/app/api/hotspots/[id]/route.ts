import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

export const runtime = 'edge';

/** PATCH /api/hotspots/[id] — rename a hotspot (admin only) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { area_name } = body;

    if (typeof area_name !== 'string' || area_name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();
    const { error } = await serviceClient
      .from('hotspots')
      .update({ area_name: area_name.trim() })
      .eq('id', params.id);

    if (error) {
      console.error('Rename hotspot error:', error);
      return NextResponse.json({ error: 'Failed to rename' }, { status: 500 });
    }

    return NextResponse.json({ success: true, area_name: area_name.trim() });
  } catch (err) {
    console.error('Hotspot PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const { id } = params;

    const { data: hotspot, error } = await supabase
      .from('hotspots')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !hotspot) {
      return NextResponse.json({ error: 'Hotspot not found' }, { status: 404 });
    }

    // Fetch the latest active cleanup for this hotspot
    const { data: cleanup } = await supabase
      .from('cleanups')
      .select('*')
      .eq('hotspot_id', id)
      .in('status', ['forming', 'scheduled', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch all report photos linked to this hotspot
    const { data: reportPhotos } = await supabase
      .from('reports')
      .select('id, image_url, severity, submitted_at')
      .eq('hotspot_id', id)
      .not('image_url', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(30);

    // Fetch past picks near this hotspot (within ~100m)
    // First get picks directly on this hotspot
    const { data: directPastPicks } = await supabase
      .from('cleanups')
      .select('id, hotspot_id, status, proposed_time, volunteer_count, bags_collected')
      .eq('hotspot_id', id)
      .in('status', ['completed', 'cancelled'])
      .order('proposed_time', { ascending: false })
      .limit(10);

    // Also find nearby hotspots within ~100m (approx 0.001 degrees)
    const delta = 0.001;
    const { data: nearbyHotspots } = await supabase
      .from('hotspots')
      .select('id')
      .gte('centroid_latitude', hotspot.centroid_latitude - delta)
      .lte('centroid_latitude', hotspot.centroid_latitude + delta)
      .gte('centroid_longitude', hotspot.centroid_longitude - delta)
      .lte('centroid_longitude', hotspot.centroid_longitude + delta)
      .neq('id', id);

    const nearbyIds = (nearbyHotspots || []).map((h: { id: string }) => h.id);
    let nearbyPastPicks: typeof directPastPicks = [];
    if (nearbyIds.length > 0) {
      const { data } = await supabase
        .from('cleanups')
        .select('id, hotspot_id, status, proposed_time, volunteer_count, bags_collected')
        .in('hotspot_id', nearbyIds)
        .in('status', ['completed', 'cancelled'])
        .order('proposed_time', { ascending: false })
        .limit(10);
      nearbyPastPicks = data || [];
    }

    // Merge and deduplicate past picks
    const seenIds = new Set<string>();
    const allPastPicks: Array<Record<string, unknown>> = [];
    const mergePicks = (directPastPicks || []).concat(nearbyPastPicks || []);
    for (let i = 0; i < mergePicks.length; i++) {
      const p = mergePicks[i];
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        allPastPicks.push(p);
      }
    }

    // Get hotspot names for past picks
    const pastHotspotIds = Array.from(new Set(allPastPicks.map((p) => p.hotspot_id as string)));
    let pastHotspotMap = new Map<string, string | null>();
    if (pastHotspotIds.length > 0) {
      const { data: hsNames } = await supabase
        .from('hotspots')
        .select('id, area_name')
        .in('id', pastHotspotIds);
      if (hsNames) {
        pastHotspotMap = new Map(hsNames.map((h: { id: string; area_name: string | null }) => [h.id, h.area_name]));
      }
    }

    const enrichedPastPicks = allPastPicks.map((p) => ({
      ...p,
      hotspot_name: pastHotspotMap.get(p.hotspot_id as string) || null,
    }));

    return NextResponse.json({
      hotspot,
      cleanup: cleanup || null,
      photos: reportPhotos || [],
      pastPicks: enrichedPastPicks,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
