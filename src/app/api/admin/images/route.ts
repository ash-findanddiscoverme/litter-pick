import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

export const runtime = 'edge';

/** GET /api/admin/images — list all images across reports, avatars, and cleanup photos (admin only) */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const serviceClient = createServiceRoleClient();

    // Fetch report images
    const { data: reports } = await serviceClient
      .from('reports')
      .select('id, image_url, submitted_at, user_id, severity, hotspot_id')
      .not('image_url', 'is', null)
      .order('submitted_at', { ascending: false });

    // Fetch user avatars
    const { data: avatars } = await serviceClient
      .from('users')
      .select('id, first_name, avatar_url, created_at')
      .not('avatar_url', 'is', null);

    // Fetch cleanup photos
    const { data: cleanupPhotos } = await serviceClient
      .from('cleanup_photos')
      .select('id, cleanup_id, image_url, photo_type, uploaded_by_user_id, created_at')
      .order('created_at', { ascending: false });

    // Normalise into a unified list
    const images: Array<{
      id: string;
      image_url: string;
      source: string;
      source_id: string;
      uploaded_at: string;
      user_id: string | null;
      meta: Record<string, string | null>;
    }> = [];

    for (const r of reports || []) {
      if (r.image_url) {
        images.push({
          id: `report-${r.id}`,
          image_url: r.image_url,
          source: 'report',
          source_id: r.id,
          uploaded_at: r.submitted_at,
          user_id: r.user_id,
          meta: { severity: r.severity, hotspot_id: r.hotspot_id },
        });
      }
    }

    for (const a of avatars || []) {
      if (a.avatar_url) {
        images.push({
          id: `avatar-${a.id}`,
          image_url: a.avatar_url,
          source: 'avatar',
          source_id: a.id,
          uploaded_at: a.created_at,
          user_id: a.id,
          meta: { user_name: a.first_name },
        });
      }
    }

    for (const cp of cleanupPhotos || []) {
      images.push({
        id: `cleanup-${cp.id}`,
        image_url: cp.image_url,
        source: 'cleanup',
        source_id: cp.id,
        uploaded_at: cp.created_at,
        user_id: cp.uploaded_by_user_id,
        meta: { cleanup_id: cp.cleanup_id, photo_type: cp.photo_type },
      });
    }

    // Sort by most recent first
    images.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    return NextResponse.json({ images });
  } catch (err) {
    console.error('Admin images error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/images — delete an image (admin only) */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, image_url, source, source_id } = await request.json();

    if (!id || !source || !source_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();

    // Delete from storage
    if (image_url) {
      try {
        const url = new URL(image_url);
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

    // Delete from database depending on source
    switch (source) {
      case 'report': {
        // Get the report to find its hotspot
        const { data: report } = await serviceClient
          .from('reports')
          .select('hotspot_id')
          .eq('id', source_id)
          .single();

        // Null out the image_url (keep the report record)
        await serviceClient
          .from('reports')
          .update({ image_url: null })
          .eq('id', source_id);

        // Clear the hotspot's cached before image if this was it
        if (report?.hotspot_id) {
          await serviceClient
            .from('hotspots')
            .update({ latest_before_image_url: null })
            .eq('id', report.hotspot_id);
        }
        break;
      }
      case 'avatar': {
        await serviceClient
          .from('users')
          .update({ avatar_url: null })
          .eq('id', source_id);
        break;
      }
      case 'cleanup': {
        await serviceClient
          .from('cleanup_photos')
          .delete()
          .eq('id', source_id);
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid source type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin delete image error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
