import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{ id: string; userId: string }>;
}

/** PATCH /api/communities/[id]/members/[userId] — update member role (admin only) */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, userId } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if current user is admin of this community
    const { data: currentMembership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', id)
      .eq('user_id', user.id)
      .single();

    if (!currentMembership || currentMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check if target user is a member
    const { data: targetMembership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', id)
      .eq('user_id', userId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: 'User is not a member' }, { status: 404 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // If demoting an admin, ensure there's at least one other admin
    if (targetMembership.role === 'admin' && role === 'member') {
      const { data: otherAdmins } = await serviceClient
        .from('community_members')
        .select('user_id')
        .eq('community_id', id)
        .eq('role', 'admin')
        .neq('user_id', userId);

      if (!otherAdmins || otherAdmins.length === 0) {
        return NextResponse.json({ error: 'Cannot demote - community must have at least one admin' }, { status: 400 });
      }
    }

    // Update role
    const { data: member, error: updateError } = await serviceClient
      .from('community_members')
      .update({ role })
      .eq('community_id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update role error:', updateError);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ member });
  } catch (err) {
    console.error('Update role error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/communities/[id]/members/[userId] — remove member (admin only) */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, userId } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if current user is admin of this community
    const { data: currentMembership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', id)
      .eq('user_id', user.id)
      .single();

    if (!currentMembership || currentMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check if target user is a member
    const { data: targetMembership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', id)
      .eq('user_id', userId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: 'User is not a member' }, { status: 404 });
    }

    // Cannot remove the creator
    const { data: community } = await serviceClient
      .from('communities')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (community?.creator_id === userId) {
      return NextResponse.json({ error: 'Cannot remove the community creator' }, { status: 400 });
    }

    // If removing an admin, ensure there's at least one other admin
    if (targetMembership.role === 'admin') {
      const { data: otherAdmins } = await serviceClient
        .from('community_members')
        .select('user_id')
        .eq('community_id', id)
        .eq('role', 'admin')
        .neq('user_id', userId);

      if (!otherAdmins || otherAdmins.length === 0) {
        return NextResponse.json({ error: 'Cannot remove - community must have at least one admin' }, { status: 400 });
      }
    }

    // Remove membership
    const { error: deleteError } = await serviceClient
      .from('community_members')
      .delete()
      .eq('community_id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Remove member error:', deleteError);
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Remove member error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
