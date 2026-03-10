import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

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
