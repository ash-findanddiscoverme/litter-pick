import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

/** PATCH /api/auth/settings — update volunteer type */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { volunteer_type } = body;

    if (!volunteer_type || !['solo', 'group', 'organise'].includes(volunteer_type)) {
      return NextResponse.json({ error: 'Invalid volunteer type' }, { status: 400 });
    }

    const { error } = await serviceClient
      .from('users')
      .update({ volunteer_type })
      .eq('id', user.id);

    if (error) {
      console.error('Update volunteer type error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/auth/settings — change password */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { new_password } = body;

    if (!new_password || new_password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { error } = await supabase.auth.updateUser({ password: new_password });

    if (error) {
      console.error('Password change error:', error);
      return NextResponse.json({ error: error.message || 'Failed to change password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/auth/settings — delete user account */
export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Delete user data from the users table
    await serviceClient
      .from('users')
      .delete()
      .eq('id', user.id);

    // Delete volunteer interests
    await serviceClient
      .from('volunteer_interests')
      .delete()
      .eq('user_id', user.id);

    // Delete the auth user via admin API
    const { error } = await serviceClient.auth.admin.deleteUser(user.id);

    if (error) {
      console.error('Delete user error:', error);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
