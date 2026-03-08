import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('hotspots')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: hotspots, error } = await query;

    if (error) {
      console.error('Hotspots fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch hotspots' }, { status: 500 });
    }

    return NextResponse.json({ hotspots: hotspots || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
