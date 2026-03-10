import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

export const runtime = 'edge';

/** PATCH /api/admin/users/[id] — warn or ban a user (admin only) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, reason } = body as { action: string; reason?: string };

    if (!['warn', 'ban', 'unban', 'clear_warning'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();

    // Build update object based on action
    let update: Record<string, string | null> = {};
    const now = new Date().toISOString();

    switch (action) {
      case 'warn':
        update = { status: 'warned', warn_reason: reason || null, warned_at: now };
        break;
      case 'ban':
        update = { status: 'banned', ban_reason: reason || null, banned_at: now };
        break;
      case 'unban':
        update = { status: 'active', ban_reason: null, banned_at: null };
        break;
      case 'clear_warning':
        update = { status: 'active', warn_reason: null, warned_at: null };
        break;
    }

    const { error: updateErr } = await serviceClient
      .from('users')
      .update(update)
      .eq('id', id);

    if (updateErr) {
      console.error('Admin user action error:', updateErr);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // If banning, also disable their auth account so they can't log in
    if (action === 'ban') {
      await serviceClient.auth.admin.updateUserById(id, {
        ban_duration: '876000h', // ~100 years
      });
    }

    // If unbanning, re-enable their auth account
    if (action === 'unban') {
      await serviceClient.auth.admin.updateUserById(id, {
        ban_duration: 'none',
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin user action error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
