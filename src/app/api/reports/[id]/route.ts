import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const serviceClient = createServiceRoleClient();
    const { id } = await params;

    const { data: report, error } = await serviceClient
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch linked hotspot if exists
    let hotspot = null;
    if (report.hotspot_id) {
      const { data } = await serviceClient
        .from('hotspots')
        .select('id, area_name, status, score, report_count')
        .eq('id', report.hotspot_id)
        .single();
      hotspot = data;
    }

    return NextResponse.json({ report, hotspot });
  } catch (err) {
    console.error('Report detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();
    const { id } = await params;

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch report to check ownership
    const { data: report, error: fetchError } = await serviceClient
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Update severity
    if (body.severity && ['low', 'medium', 'bad'].includes(body.severity)) {
      updates.severity = body.severity;
    }

    // Mark as cleaned
    if (body.status === 'cleaned') {
      updates.status = 'cleaned';

      // Also update linked hotspot if exists
      if (report.hotspot_id) {
        await serviceClient
          .from('hotspots')
          .update({
            status: 'recently_improved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', report.hotspot_id);
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await serviceClient
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Report update error:', updateError);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }

    return NextResponse.json({ report: updated });
  } catch (err) {
    console.error('Report PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
