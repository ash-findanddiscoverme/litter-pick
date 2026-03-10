import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

/** PATCH /api/cleanups/[id]/council — update council notification status (organiser only) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();
    const { id } = params;

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch cleanup to verify organiser
    const { data: cleanup, error: fetchError } = await serviceClient
      .from('cleanups')
      .select('id, organiser_user_id')
      .eq('id', id)
      .single();

    if (fetchError || !cleanup) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 });
    }

    if (cleanup.organiser_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the organiser can update council status' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, boolean> = {};

    if (typeof body.council_notified === 'boolean') {
      updates.council_notified = body.council_notified;
    }
    if (typeof body.council_collection_confirmed === 'boolean') {
      updates.council_collection_confirmed = body.council_collection_confirmed;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const { error: updateError } = await serviceClient
      .from('cleanups')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Council update error:', updateError);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...updates });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
