import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

/** GET /api/picks — list upcoming picks (public) */
export async function GET(request: NextRequest) {
  try {
    const serviceClient = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const hotspotId = searchParams.get('hotspot_id');

    // Fetch scheduled cleanups with proposed_time in the future
    let query = serviceClient
      .from('cleanups')
      .select('id, hotspot_id, organiser_user_id, proposed_time, volunteer_count, notes, status, council_notified, council_collection_confirmed')
      .eq('status', 'scheduled')
      .not('proposed_time', 'is', null)
      .gte('proposed_time', new Date().toISOString())
      .order('proposed_time', { ascending: true })
      .limit(50);

    if (hotspotId) {
      query = query.eq('hotspot_id', hotspotId);
    }

    const { data: picks, error } = await query;

    if (error) {
      console.error('Picks fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch picks' }, { status: 500 });
    }

    if (!picks || picks.length === 0) {
      return NextResponse.json({ picks: [] });
    }

    // Gather unique organiser and hotspot IDs
    const organiserIds = Array.from(new Set(picks.map((p) => p.organiser_user_id).filter(Boolean))) as string[];
    const hotspotIds = Array.from(new Set(picks.map((p) => p.hotspot_id)));

    // Fetch organisers
    const { data: organisers } = await serviceClient
      .from('users')
      .select('id, first_name, avatar_url')
      .in('id', organiserIds);

    // Fetch hotspots
    const { data: hotspots } = await serviceClient
      .from('hotspots')
      .select('id, area_name, centroid_latitude, centroid_longitude')
      .in('id', hotspotIds);

    const organiserMap = new Map((organisers || []).map((o) => [o.id, o]));
    const hotspotMap = new Map((hotspots || []).map((h) => [h.id, h]));

    const enrichedPicks = picks.map((p) => {
      const org = organiserMap.get(p.organiser_user_id || '');
      const hs = hotspotMap.get(p.hotspot_id);
      return {
        id: p.id,
        hotspot_id: p.hotspot_id,
        hotspot_name: hs?.area_name || null,
        hotspot_lat: hs?.centroid_latitude || 0,
        hotspot_lng: hs?.centroid_longitude || 0,
        organiser_id: p.organiser_user_id || '',
        organiser_name: org?.first_name || 'Volunteer',
        organiser_avatar: org?.avatar_url || null,
        proposed_time: p.proposed_time,
        volunteer_count: p.volunteer_count,
        notes: p.notes,
        status: p.status,
        council_notified: p.council_notified ?? false,
        council_collection_confirmed: p.council_collection_confirmed ?? false,
      };
    });

    return NextResponse.json({ picks: enrichedPicks });
  } catch (err) {
    console.error('Picks error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/picks — create a new pick (auth required) */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { hotspot_id, proposed_time, notes } = body;

    if (!hotspot_id || !proposed_time) {
      return NextResponse.json({ error: 'Hotspot and date/time are required' }, { status: 400 });
    }

    // Validate proposed_time is in the future
    if (new Date(proposed_time) <= new Date()) {
      return NextResponse.json({ error: 'Pick date must be in the future' }, { status: 400 });
    }

    // Validate hotspot exists
    const { data: hotspot, error: hsError } = await serviceClient
      .from('hotspots')
      .select('id, status')
      .eq('id', hotspot_id)
      .single();

    if (hsError || !hotspot) {
      return NextResponse.json({ error: 'Hotspot not found' }, { status: 404 });
    }

    // Create the pick (as a cleanup with status='scheduled')
    const { data: pick, error: insertError } = await serviceClient
      .from('cleanups')
      .insert({
        hotspot_id,
        organiser_user_id: user.id,
        status: 'scheduled',
        proposed_time,
        volunteer_count: 1, // organiser counts as first volunteer
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Pick creation error:', insertError);
      return NextResponse.json({ error: 'Failed to create pick' }, { status: 500 });
    }

    // Update hotspot status if it's just 'needs_attention'
    if (hotspot.status === 'needs_attention') {
      await serviceClient
        .from('hotspots')
        .update({ status: 'cleanup_forming', updated_at: new Date().toISOString() })
        .eq('id', hotspot_id);
    }

    // Also add organiser as a volunteer interest
    await serviceClient
      .from('volunteer_interests')
      .insert({
        user_id: user.id,
        hotspot_id,
        interest_type: 'organise',
      });

    return NextResponse.json({ pick }, { status: 201 });
  } catch (err) {
    console.error('Pick creation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
