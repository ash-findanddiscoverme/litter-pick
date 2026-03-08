import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const { id } = params;

    const { data: cleanup, error } = await supabase
      .from('cleanups')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !cleanup) {
      return NextResponse.json({ error: 'Cleanup not found' }, { status: 404 });
    }

    // Fetch associated hotspot
    const { data: hotspot } = await supabase
      .from('hotspots')
      .select('*')
      .eq('id', cleanup.hotspot_id)
      .single();

    return NextResponse.json({ cleanup, hotspot: hotspot || null });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
