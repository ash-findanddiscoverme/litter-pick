import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { latitude, longitude, radius_km } = body;

    // Validate
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof radius_km !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (radius_km < 1 || radius_km > 25) {
      return NextResponse.json({ error: 'Radius must be between 1 and 25 km' }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();

    const { error: updateError } = await serviceClient
      .from('users')
      .update({
        volunteer_lat: latitude,
        volunteer_lng: longitude,
        volunteer_radius_km: radius_km,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Radius update error:', updateError);
      return NextResponse.json({ error: 'Failed to save radius' }, { status: 500 });
    }

    return NextResponse.json({
      volunteer_lat: latitude,
      volunteer_lng: longitude,
      volunteer_radius_km: radius_km,
    });
  } catch (err) {
    console.error('Radius error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
