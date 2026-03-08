import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { HOTSPOT_VOLUNTEER_THRESHOLD } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { hotspot_id, interest_type } = await request.json();

    if (!hotspot_id || !interest_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing interest
    const { data: existing } = await serviceClient
      .from('volunteer_interests')
      .select('id')
      .eq('user_id', user.id)
      .eq('hotspot_id', hotspot_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You already expressed interest in this hotspot' }, { status: 409 });
    }

    // Create volunteer interest
    const { error: insertError } = await serviceClient
      .from('volunteer_interests')
      .insert({
        user_id: user.id,
        hotspot_id,
        interest_type,
      });

    if (insertError) {
      console.error('Interest insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save interest' }, { status: 500 });
    }

    // Update hotspot volunteer count
    const { data: hotspot } = await serviceClient
      .from('hotspots')
      .select('volunteer_interest_count, status')
      .eq('id', hotspot_id)
      .single();

    if (hotspot) {
      const newCount = (hotspot.volunteer_interest_count || 0) + 1;
      const updates: Record<string, unknown> = {
        volunteer_interest_count: newCount,
        updated_at: new Date().toISOString(),
      };

      // Check if we should transition to "cleanup_forming"
      if (newCount >= HOTSPOT_VOLUNTEER_THRESHOLD && hotspot.status === 'needs_attention') {
        updates.status = 'cleanup_forming';

        // Create a cleanup record
        await serviceClient
          .from('cleanups')
          .insert({
            hotspot_id,
            status: 'forming',
            volunteer_count: newCount,
            organiser_user_id: interest_type === 'organise' ? user.id : null,
          });
      }

      await serviceClient
        .from('hotspots')
        .update(updates)
        .eq('id', hotspot_id);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Interest error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
