import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // Check required env vars before proceeding
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Profile error: Missing Supabase URL or anon key');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // If service role key is missing, return basic profile from auth user
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set — returning basic profile');
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Volunteer',
          volunteer_type: user.user_metadata?.volunteer_type || 'solo',
          postcode_or_town: user.user_metadata?.postcode_or_town || '',
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        stats: {
          cleanups_joined: 0,
          cleanups_completed: 0,
          areas_helped: 0,
        },
        reports: [],
      });
    }

    const serviceClient = createServiceRoleClient();

    // Fetch user profile
    const { data: profile, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      // Profile row doesn't exist yet — return basic info from auth
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Volunteer',
          volunteer_type: user.user_metadata?.volunteer_type || 'solo',
          postcode_or_town: user.user_metadata?.postcode_or_town || '',
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        stats: {
          cleanups_joined: 0,
          cleanups_completed: 0,
          areas_helped: 0,
        },
        reports: [],
      });
    }

    // Run independent queries in parallel
    const [interestsResult, reportsResult, organisedResult, joinedResult] = await Promise.all([
      serviceClient
        .from('volunteer_interests')
        .select('hotspot_id')
        .eq('user_id', user.id),
      serviceClient
        .from('reports')
        .select('id, image_url, severity, submitted_at, latitude, longitude, hotspot_id')
        .eq('user_id', user.id)
        .not('image_url', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(20),
      serviceClient
        .from('cleanups')
        .select('id, hotspot_id, status, proposed_time, volunteer_count, bags_collected')
        .eq('organiser_user_id', user.id)
        .order('proposed_time', { ascending: false })
        .limit(20),
      serviceClient
        .from('volunteer_interests')
        .select('hotspot_id')
        .eq('user_id', user.id),
    ]);

    const interests = interestsResult.data || [];
    const userReports = reportsResult.data || [];
    const organisedPicks = organisedResult.data || [];

    // Find picks the user joined (via volunteer_interests on hotspots that have cleanups)
    const joinedHotspotIds = (joinedResult.data || []).map((i: { hotspot_id: string }) => i.hotspot_id);
    let joinedPicks: Array<{ id: string; hotspot_id: string; status: string; proposed_time: string | null; volunteer_count: number; bags_collected: number | null }> = [];
    if (joinedHotspotIds.length > 0) {
      const { data } = await serviceClient
        .from('cleanups')
        .select('id, hotspot_id, status, proposed_time, volunteer_count, bags_collected')
        .in('hotspot_id', joinedHotspotIds)
        .neq('organiser_user_id', user.id)
        .order('proposed_time', { ascending: false })
        .limit(20);
      joinedPicks = data || [];
    }

    // Merge and deduplicate picks, tag with role
    interface PickRow {
      id: string;
      hotspot_id: string;
      status: string;
      proposed_time: string | null;
      volunteer_count: number;
      bags_collected: number | null;
      role: string;
      hotspot_name?: string | null;
      hotspot_county?: string | null;
    }

    const allPickIds = new Set<string>();
    const userPicks: PickRow[] = [];

    for (let i = 0; i < organisedPicks.length; i++) {
      const p = organisedPicks[i];
      allPickIds.add(p.id);
      userPicks.push({ ...p, role: 'organiser' });
    }
    for (let i = 0; i < joinedPicks.length; i++) {
      const p = joinedPicks[i];
      if (!allPickIds.has(p.id)) {
        allPickIds.add(p.id);
        userPicks.push({ ...p, role: 'volunteer' });
      }
    }

    // Fetch hotspot names for all picks
    const pickHotspotIds = Array.from(new Set(userPicks.map((p) => p.hotspot_id)));
    let hotspotNameMap = new Map<string, { area_name: string | null; county: string | null }>();
    if (pickHotspotIds.length > 0) {
      const { data: hsData } = await serviceClient
        .from('hotspots')
        .select('id, area_name, county')
        .in('id', pickHotspotIds);
      if (hsData) {
        hotspotNameMap = new Map(hsData.map((h: { id: string; area_name: string | null; county: string | null }) => [h.id, { area_name: h.area_name, county: h.county }]));
      }
    }

    const enrichedPicks = userPicks.map((p) => {
      const hs = hotspotNameMap.get(p.hotspot_id);
      return {
        ...p,
        hotspot_name: hs?.area_name || null,
        hotspot_county: hs?.county || null,
      };
    });

    // Sort: upcoming first (ascending), then past (descending)
    enrichedPicks.sort((a, b) => {
      const aTime = a.proposed_time ? new Date(a.proposed_time).getTime() : 0;
      const bTime = b.proposed_time ? new Date(b.proposed_time).getTime() : 0;
      const now = Date.now();
      const aFuture = aTime >= now;
      const bFuture = bTime >= now;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      if (aFuture && bFuture) return aTime - bTime;
      return bTime - aTime;
    });

    // Use interests data for both count and hotspot ID lookup
    const hotspotIds = interests.map((i: { hotspot_id: string }) => i.hotspot_id);

    let completedCleanups: { hotspot_id: string }[] = [];
    if (hotspotIds.length > 0) {
      const { data } = await serviceClient
        .from('cleanups')
        .select('hotspot_id')
        .eq('status', 'completed')
        .in('hotspot_id', hotspotIds);
      completedCleanups = data || [];
    }

    const uniqueAreas = new Set(completedCleanups.map((c) => c.hotspot_id));

    // Fetch user's communities
    const { data: memberships } = await serviceClient
      .from('community_members')
      .select('community_id, role')
      .eq('user_id', user.id);

    let communities: Array<{ id: string; name: string; photo_url: string | null; area_name: string | null; role: string }> = [];
    if (memberships && memberships.length > 0) {
      const communityIds = memberships.map((m: { community_id: string }) => m.community_id);
      const { data: comms } = await serviceClient
        .from('communities')
        .select('id, name, photo_url, area_name')
        .in('id', communityIds);

      const roleMap = new Map(memberships.map((m: { community_id: string; role: string }) => [m.community_id, m.role]));
      communities = (comms || []).map((c: { id: string; name: string; photo_url: string | null; area_name: string | null }) => ({
        ...c,
        role: roleMap.get(c.id) || 'member',
      }));
    }

    return NextResponse.json({
      user: profile,
      stats: {
        cleanups_joined: interests.length,
        cleanups_completed: completedCleanups.length,
        areas_helped: uniqueAreas.size,
      },
      reports: userReports,
      picks: enrichedPicks,
      communities,
    });
  } catch (err) {
    console.error('Profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
