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

    // Also fetch the latest cleanup for this hotspot
    const { data: cleanup } = await supabase
      .from('cleanups')
      .select('*')
      .eq('hotspot_id', id)
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

    return NextResponse.json({
      hotspot,
      cleanup: cleanup || null,
      photos: reportPhotos || [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
