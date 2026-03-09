import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();
    const { id } = params;

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch the pick (cleanup)
    const { data: pick, error: fetchError } = await serviceClient
      .from('cleanups')
      .select('id, hotspot_id, organiser_user_id, status, volunteer_count')
      .eq('id', id)
      .single();

    if (fetchError || !pick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 });
    }

    if (pick.status !== 'scheduled') {
      return NextResponse.json({ error: 'This pick is no longer open for joining' }, { status: 400 });
    }

    // Check if user already joined
    const { data: existing } = await serviceClient
      .from('volunteer_interests')
      .select('id')
      .eq('user_id', user.id)
      .eq('hotspot_id', pick.hotspot_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You have already joined this pick' }, { status: 409 });
    }

    // Add volunteer interest
    const { error: insertError } = await serviceClient
      .from('volunteer_interests')
      .insert({
        user_id: user.id,
        hotspot_id: pick.hotspot_id,
        interest_type: 'join',
      });

    if (insertError) {
      console.error('Join insert error:', insertError);
      return NextResponse.json({ error: 'Failed to join pick' }, { status: 500 });
    }

    // Increment volunteer count
    const newCount = (pick.volunteer_count || 0) + 1;
    await serviceClient
      .from('cleanups')
      .update({ volunteer_count: newCount })
      .eq('id', id);

    // Update hotspot volunteer count too
    const { data: hotspot } = await serviceClient
      .from('hotspots')
      .select('volunteer_interest_count')
      .eq('id', pick.hotspot_id)
      .single();

    if (hotspot) {
      await serviceClient
        .from('hotspots')
        .update({
          volunteer_interest_count: (hotspot.volunteer_interest_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pick.hotspot_id);
    }

    return NextResponse.json({ success: true, volunteer_count: newCount }, { status: 201 });
  } catch (err) {
    console.error('Join pick error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
