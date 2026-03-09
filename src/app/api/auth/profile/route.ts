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
        },
        stats: {
          cleanups_joined: 0,
          cleanups_completed: 0,
          areas_helped: 0,
        },
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
        },
        stats: {
          cleanups_joined: 0,
          cleanups_completed: 0,
          areas_helped: 0,
        },
      });
    }

    // Fetch stats
    const { count: interestsCount } = await serviceClient
      .from('volunteer_interests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { data: completedCleanups } = await serviceClient
      .from('cleanups')
      .select('hotspot_id')
      .eq('status', 'completed')
      .in('hotspot_id',
        (await serviceClient
          .from('volunteer_interests')
          .select('hotspot_id')
          .eq('user_id', user.id)
        ).data?.map((i: { hotspot_id: string }) => i.hotspot_id) || []
      );

    const uniqueAreas = new Set(completedCleanups?.map((c: { hotspot_id: string }) => c.hotspot_id) || []);

    return NextResponse.json({
      user: profile,
      stats: {
        cleanups_joined: interestsCount || 0,
        cleanups_completed: completedCleanups?.length || 0,
        areas_helped: uniqueAreas.size,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
