import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is a participant or organiser
    const { data: cleanup } = await serviceClient
      .from('cleanups')
      .select('organiser_user_id, status')
      .eq('id', id)
      .single();

    if (!cleanup) {
      return NextResponse.json({ error: 'Cleanup not found' }, { status: 404 });
    }

    const { data: interest } = await serviceClient
      .from('volunteer_interests')
      .select('id')
      .eq('hotspot_id', id)
      .eq('user_id', user.id)
      .single();

    const isOrganiser = cleanup.organiser_user_id === user.id;
    const isParticipant = !!interest;

    if (!isOrganiser && !isParticipant) {
      return NextResponse.json({ error: 'Only participants can confirm the event' }, { status: 403 });
    }

    const formData = await request.formData();
    const eventConfirmed = formData.get('event_confirmed') === 'true';

    // Upload any after photos
    const photoUrls: string[] = [];
    const entries = Array.from(formData.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (key.startsWith('after_photo_') && value instanceof File) {
        const file = value;
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await serviceClient.storage
          .from('cleanup-photos')
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!uploadError) {
          const { data: urlData } = serviceClient.storage
            .from('cleanup-photos')
            .getPublicUrl(fileName);
          photoUrls.push(urlData.publicUrl);
        }
      }
    }

    // Update cleanup status
    const updates: Record<string, unknown> = {
      event_confirmed: eventConfirmed,
      status: eventConfirmed ? 'completed' : 'cancelled',
    };

    if (eventConfirmed) {
      updates.completed_at = new Date().toISOString();
    }

    if (photoUrls.length > 0) {
      updates.after_photos = photoUrls;
    }

    const { error: updateError } = await serviceClient
      .from('cleanups')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Confirm update error:', updateError);
      return NextResponse.json({ error: 'Failed to confirm event' }, { status: 500 });
    }

    // Also insert photos into cleanup_photos table if any
    if (photoUrls.length > 0) {
      const photoRecords = photoUrls.map(url => ({
        cleanup_id: id,
        photo_type: 'after' as const,
        image_url: url,
        uploaded_by_user_id: user.id,
      }));

      await serviceClient
        .from('cleanup_photos')
        .insert(photoRecords);
    }

    return NextResponse.json({ success: true, photoUrls });
  } catch (err) {
    console.error('Confirm API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
