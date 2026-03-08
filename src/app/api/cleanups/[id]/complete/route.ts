import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();
    const { id } = params;

    // Optional auth check — allow logged-in users
    const { data: { user } } = await supabase.auth.getUser();

    const formData = await request.formData();
    const status = formData.get('status') as string;
    const afterImage = formData.get('after_image') as File | null;
    const bagsCollected = formData.get('bags_collected') as string | null;
    const volunteerCount = formData.get('volunteer_count') as string | null;
    const notes = formData.get('notes') as string | null;

    // Fetch cleanup
    const { data: cleanup, error: fetchError } = await serviceClient
      .from('cleanups')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !cleanup) {
      return NextResponse.json({ error: 'Cleanup not found' }, { status: 404 });
    }

    let afterImageUrl: string | null = null;

    // Upload after image
    if (afterImage) {
      const fileName = `cleanups/${id}/after-${Date.now()}.jpg`;
      const buffer = Buffer.from(await afterImage.arrayBuffer());

      const { data: uploadData, error: uploadError } = await serviceClient.storage
        .from('photos')
        .upload(fileName, buffer, {
          contentType: afterImage.type || 'image/jpeg',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrl } = serviceClient.storage
          .from('photos')
          .getPublicUrl(uploadData.path);
        afterImageUrl = publicUrl.publicUrl;
      }
    }

    // Save cleanup photo record
    if (afterImageUrl) {
      await serviceClient
        .from('cleanup_photos')
        .insert({
          cleanup_id: id,
          photo_type: 'after',
          image_url: afterImageUrl,
          uploaded_by_user_id: user?.id || null,
        });
    }

    // Map completion status to hotspot status
    const hotspotStatusMap: Record<string, string> = {
      improved: 'recently_improved',
      mostly_cleared: 'recently_improved',
      fully_cleaned: 'cleaned',
    };

    // Update cleanup
    await serviceClient
      .from('cleanups')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        bags_collected: bagsCollected ? parseInt(bagsCollected) : null,
        volunteer_count: volunteerCount ? parseInt(volunteerCount) : cleanup.volunteer_count,
        notes: notes || null,
      })
      .eq('id', id);

    // Update hotspot
    const hotspotUpdate: Record<string, unknown> = {
      status: hotspotStatusMap[status] || 'recently_improved',
      updated_at: new Date().toISOString(),
    };

    if (afterImageUrl) {
      hotspotUpdate.latest_after_image_url = afterImageUrl;
    }

    await serviceClient
      .from('hotspots')
      .update(hotspotUpdate)
      .eq('id', cleanup.hotspot_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cleanup completion error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
