import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
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
