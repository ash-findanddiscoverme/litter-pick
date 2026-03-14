import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface RouteParams {
  params: { id: string };
}

/** POST /api/cleanups/[id]/community — link a community to a pick (admin only) */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const communityId = body.community_id as string;

    if (!communityId) {
      return NextResponse.json({ error: 'community_id is required' }, { status: 400 });
    }

    // Verify user is admin of this community
    const { data: membership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'You must be a community admin' }, { status: 403 });
    }

    // Verify the pick exists
    const { data: pick } = await serviceClient
      .from('cleanups')
      .select('id')
      .eq('id', id)
      .single();

    if (!pick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 });
    }

    // Link the community
    const { error: updateError } = await serviceClient
      .from('cleanups')
      .update({ community_id: communityId })
      .eq('id', id);

    if (updateError) {
      console.error('Link community error:', updateError);
      return NextResponse.json({ error: 'Failed to link community' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Link community error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/cleanups/[id]/community — unlink community from a pick (admin only) */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get current community link
    const { data: pick } = await serviceClient
      .from('cleanups')
      .select('community_id')
      .eq('id', id)
      .single();

    if (!pick?.community_id) {
      return NextResponse.json({ error: 'No community linked' }, { status: 400 });
    }

    // Verify user is admin of linked community
    const { data: membership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', pick.community_id)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'You must be a community admin' }, { status: 403 });
    }

    const { error: updateError } = await serviceClient
      .from('cleanups')
      .update({ community_id: null })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to unlink community' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unlink community error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
