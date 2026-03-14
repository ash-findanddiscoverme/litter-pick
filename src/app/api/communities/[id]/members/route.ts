import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** POST /api/communities/[id]/members — join community */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if community exists
    const { data: community } = await serviceClient
      .from('communities')
      .select('id')
      .eq('id', id)
      .single();

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if already a member
    const { data: existingMember } = await serviceClient
      .from('community_members')
      .select('user_id')
      .eq('community_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Add as member
    const { data: member, error: insertError } = await serviceClient
      .from('community_members')
      .insert({
        community_id: id,
        user_id: user.id,
        role: 'member',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Join community error:', insertError);
      return NextResponse.json({ error: 'Failed to join community' }, { status: 500 });
    }

    return NextResponse.json({ member }, { status: 201 });
  } catch (err) {
    console.error('Join community error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/communities/[id]/members — leave community */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if community exists and user is a member
    const { data: membership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 400 });
    }

    // Check if user is the creator - creators cannot leave
    const { data: community } = await serviceClient
      .from('communities')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (community?.creator_id === user.id) {
      return NextResponse.json({ error: 'Community creator cannot leave. Delete the community instead.' }, { status: 400 });
    }

    // If user is an admin, ensure there's at least one other admin
    if (membership.role === 'admin') {
      const { data: otherAdmins } = await serviceClient
        .from('community_members')
        .select('user_id')
        .eq('community_id', id)
        .eq('role', 'admin')
        .neq('user_id', user.id);

      if (!otherAdmins || otherAdmins.length === 0) {
        return NextResponse.json({ error: 'Cannot leave - you are the only admin. Assign another admin first.' }, { status: 400 });
      }
    }

    // Remove membership
    const { error: deleteError } = await serviceClient
      .from('community_members')
      .delete()
      .eq('community_id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Leave community error:', deleteError);
      return NextResponse.json({ error: 'Failed to leave community' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Leave community error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
