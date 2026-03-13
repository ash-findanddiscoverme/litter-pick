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

    // Run independent queries in parallel instead of sequentially
    const [interestsResult, reportsResult] = await Promise.all([
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
    ]);

    const interests = interestsResult.data || [];
    const userReports = reportsResult.data || [];

    // Use interests data for both count and hotspot ID lookup (avoids duplicate query)
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

    return NextResponse.json({
      user: profile,
      stats: {
        cleanups_joined: interests.length,
        cleanups_completed: completedCleanups.length,
        areas_helped: uniqueAreas.size,
      },
      reports: userReports,
    });
  } catch (err) {
    console.error('Profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
