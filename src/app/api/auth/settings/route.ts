import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const PANEL_KEYS = ['show_stats', 'show_area', 'show_equipment', 'show_picks', 'show_reports', 'show_communities'] as const;

/** PATCH /api/auth/settings — update user settings */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Volunteer type
    if (body.volunteer_type) {
      if (!['solo', 'group', 'organise'].includes(body.volunteer_type)) {
        return NextResponse.json({ error: 'Invalid volunteer type' }, { status: 400 });
      }
      updates.volunteer_type = body.volunteer_type;
    }

    // Panel visibility toggles
    for (const key of PANEL_KEYS) {
      if (typeof body[key] === 'boolean') {
        updates[key] = body[key];
      }
    }

    // Volunteer area privacy
    if (typeof body.area_visible === 'boolean') {
      updates.area_visible = body.area_visible;
    }

    // Profile slug
    if (typeof body.profile_slug === 'string') {
      const slug = body.profile_slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (slug.length < 3 || slug.length > 40) {
        return NextResponse.json({ error: 'Profile URL must be 3-40 characters (letters, numbers, hyphens)' }, { status: 400 });
      }
      // Check uniqueness
      const { data: existing } = await serviceClient
        .from('users')
        .select('id')
        .eq('profile_slug', slug)
        .neq('id', user.id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: 'That profile URL is already taken' }, { status: 409 });
      }
      updates.profile_slug = slug;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { error } = await serviceClient
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Settings update error:', error);
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
