import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

export const runtime = 'edge';

/** DELETE /api/admin/reports/[id] — delete a report photo (admin only) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const serviceClient = createServiceRoleClient();
    const { id } = params;

    // Get the report first to find its hotspot and image URL
    const { data: report, error: fetchErr } = await serviceClient
      .from('reports')
      .select('id, hotspot_id, image_url')
      .eq('id', id)
      .single();

    if (fetchErr || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Delete the image from Supabase Storage if it exists
    if (report.image_url) {
      try {
        const url = new URL(report.image_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (pathMatch) {
          const bucket = pathMatch[1];
          const filePath = pathMatch[2];
          await serviceClient.storage.from(bucket).remove([filePath]);
        }
      } catch {
        console.error('Failed to delete image from storage');
      }
    }

    // Delete the report row
    const { error: deleteErr } = await serviceClient
      .from('reports')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      console.error('Delete report error:', deleteErr);
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
    }

    // Update the hotspot's report count by counting remaining reports
    if (report.hotspot_id) {
      const { count } = await serviceClient
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('hotspot_id', report.hotspot_id);

      await serviceClient
        .from('hotspots')
        .update({ report_count: count || 0 })
        .eq('id', report.hotspot_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin delete report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
