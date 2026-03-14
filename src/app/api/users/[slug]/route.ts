import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface RouteParams {
  params: { slug: string };
}

/** GET /api/users/[slug] — public profile (auth-gated, respects visibility settings) */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    // Auth gate — only logged-in users can view profiles
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Look up by slug or by user ID
    let profile;
    const { data: bySlug } = await serviceClient
      .from('users')
      .select('*')
      .eq('profile_slug', slug)
      .maybeSingle();

    if (bySlug) {
      profile = bySlug;
    } else {
      const { data: byId } = await serviceClient
        .from('users')
        .select('*')
        .eq('id', slug)
        .maybeSingle();
      profile = byId;
    }

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwnProfile = profile.id === user.id;

    // Build response respecting visibility settings
    const result: Record<string, unknown> = {
      id: profile.id,
      first_name: profile.first_name,
      avatar_url: profile.avatar_url,
      volunteer_type: profile.volunteer_type,
      postcode_or_town: profile.postcode_or_town,
      created_at: profile.created_at,
      profile_slug: profile.profile_slug,
      is_own_profile: isOwnProfile,
    };

    // Stats
    if (isOwnProfile || profile.show_stats !== false) {
      const [interestsRes, completedRes] = await Promise.all([
        serviceClient
          .from('volunteer_interests')
          .select('hotspot_id')
          .eq('user_id', profile.id),
        serviceClient
          .from('cleanups')
          .select('hotspot_id')
          .eq('status', 'completed')
          .in('hotspot_id',
            (await serviceClient
              .from('volunteer_interests')
              .select('hotspot_id')
              .eq('user_id', profile.id)
            ).data?.map((i: { hotspot_id: string }) => i.hotspot_id) || ['__none__']
          ),
      ]);

      const interests = interestsRes.data || [];
      const completed = completedRes.data || [];
      const uniqueAreas = new Set(completed.map((c: { hotspot_id: string }) => c.hotspot_id));

      result.stats = {
        cleanups_joined: interests.length,
        cleanups_completed: completed.length,
        areas_helped: uniqueAreas.size,
      };
    }

    // Volunteer area
    if (isOwnProfile || (profile.show_area !== false && profile.area_visible !== false)) {
      result.volunteer_area = {
        lat: profile.volunteer_lat,
        lng: profile.volunteer_lng,
        radius_km: profile.volunteer_radius_km,
      };
    }

    // Equipment
    if (isOwnProfile || profile.show_equipment !== false) {
      result.equipment = {
        equipment_bags: profile.equipment_bags,
        equipment_bag_hoop: profile.equipment_bag_hoop,
        equipment_gloves: profile.equipment_gloves,
        equipment_litter_picker: profile.equipment_litter_picker,
      };
    }

    // Communities
    if (isOwnProfile || profile.show_communities !== false) {
      const { data: memberships } = await serviceClient
        .from('community_members')
        .select('community_id, role')
        .eq('user_id', profile.id);

      if (memberships && memberships.length > 0) {
        const communityIds = memberships.map((m: { community_id: string }) => m.community_id);
        const { data: communities } = await serviceClient
          .from('communities')
          .select('id, name, photo_url, area_name')
          .in('id', communityIds);

        const roleMap = new Map(memberships.map((m: { community_id: string; role: string }) => [m.community_id, m.role]));
        result.communities = (communities || []).map((c: { id: string; name: string; photo_url: string | null; area_name: string | null }) => ({
          ...c,
          role: roleMap.get(c.id) || 'member',
        }));
      } else {
        result.communities = [];
      }
    }

    // Picks
    if (isOwnProfile || profile.show_picks !== false) {
      const { data: organised } = await serviceClient
        .from('cleanups')
        .select('id, hotspot_id, status, proposed_time, volunteer_count, bags_collected')
        .eq('organiser_user_id', profile.id)
        .order('proposed_time', { ascending: false })
        .limit(10);

      result.picks = (organised || []).map((p: { id: string; status: string; proposed_time: string | null; volunteer_count: number }) => ({
        ...p,
        role: 'organiser',
      }));
    }

    // Reports
    if (isOwnProfile || profile.show_reports !== false) {
      const { data: reports } = await serviceClient
        .from('reports')
        .select('id, image_url, severity, submitted_at')
        .eq('user_id', profile.id)
        .not('image_url', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(12);

      result.reports = reports || [];
    }

    // Panel visibility (so viewer knows which sections exist)
    result.panels = {
      show_stats: profile.show_stats !== false,
      show_area: profile.show_area !== false,
      show_equipment: profile.show_equipment !== false,
      show_picks: profile.show_picks !== false,
      show_reports: profile.show_reports !== false,
      show_communities: profile.show_communities !== false,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Public profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
