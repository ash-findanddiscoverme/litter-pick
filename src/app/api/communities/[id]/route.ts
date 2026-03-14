import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/communities/[id] — get community details with members */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const serviceClient = createServiceRoleClient();

    // Try to get current user for membership info
    let currentUserId: string | null = null;
    try {
      const authClient = createServerSupabaseClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) currentUserId = user.id;
    } catch {
      // Not logged in
    }

    // Fetch community
    const { data: community, error } = await serviceClient
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Fetch members with user info
    const { data: members } = await serviceClient
      .from('community_members')
      .select('community_id, user_id, role, joined_at')
      .eq('community_id', id)
      .order('joined_at', { ascending: true });

    // Fetch user details for members
    const memberUserIds = (members || []).map((m: { user_id: string }) => m.user_id);
    const { data: users } = await serviceClient
      .from('users')
      .select('id, first_name, avatar_url')
      .in('id', memberUserIds);

    const userMap = new Map((users || []).map((u: { id: string; first_name: string; avatar_url: string | null }) => [u.id, u]));

    const membersWithUsers = (members || []).map((m: { community_id: string; user_id: string; role: string; joined_at: string }) => ({
      ...m,
      user: userMap.get(m.user_id) || { id: m.user_id, first_name: 'Unknown', avatar_url: null },
    }));

    // Fetch creator info
    const { data: creator } = await serviceClient
      .from('users')
      .select('id, first_name, avatar_url')
      .eq('id', community.creator_id)
      .single();

    // Fetch community picks
    const { data: picks } = await serviceClient
      .from('cleanups')
      .select('id, hotspot_id, proposed_time, volunteer_count, status')
      .eq('community_id', id)
      .eq('status', 'scheduled')
      .gte('proposed_time', new Date().toISOString())
      .order('proposed_time', { ascending: true })
      .limit(10);

    // Check current user's membership
    const userMembership = currentUserId
      ? (members || []).find((m: { user_id: string }) => m.user_id === currentUserId)
      : null;

    return NextResponse.json({
      community: {
        ...community,
        member_count: (members || []).length,
        is_member: !!userMembership,
        user_role: userMembership?.role || null,
        creator: creator || null,
      },
      members: membersWithUsers,
      picks: picks || [],
    });
  } catch (err) {
    console.error('Community fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/communities/[id] — update community (admin only) */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin of this community
    const { data: membership } = await serviceClient
      .from('community_members')
      .select('role')
      .eq('community_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const center_lat = formData.get('center_lat') as string | null;
    const center_lng = formData.get('center_lng') as string | null;
    const radius_km = formData.get('radius_km') as string | null;
    const image = formData.get('photo') as File | null;

    const updates: Record<string, unknown> = {};

    if (name) {
      if (name.length < 3 || name.length > 100) {
        return NextResponse.json({ error: 'Name must be between 3 and 100 characters' }, { status: 400 });
      }
      updates.name = name;
    }

    if (description !== null) {
      updates.description = description || null;
    }

    if (center_lat && center_lng) {
      updates.center_lat = parseFloat(center_lat);
      updates.center_lng = parseFloat(center_lng);
      updates.area_name = await reverseGeocode(updates.center_lat as number, updates.center_lng as number);
    }

    if (radius_km) {
      const km = parseFloat(radius_km);
      if (km < 0.5 || km > 50) {
        return NextResponse.json({ error: 'Radius must be between 0.5 and 50 km' }, { status: 400 });
      }
      updates.radius_km = km;
    }

    // Upload new photo if provided
    if (image) {
      const fileName = `communities/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { data: uploadData, error: uploadError } = await serviceClient.storage
        .from('community-photos')
        .upload(fileName, buffer, {
          contentType: image.type || 'image/jpeg',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrl } = serviceClient.storage
          .from('community-photos')
          .getPublicUrl(uploadData.path);
        updates.photo_url = publicUrl.publicUrl;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { data: community, error: updateError } = await serviceClient
      .from('communities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Community update error:', updateError);
      return NextResponse.json({ error: 'Failed to update community' }, { status: 500 });
    }

    return NextResponse.json({ community });
  } catch (err) {
    console.error('Community update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/communities/[id] — delete community (creator only) */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is the creator
    const { data: community } = await serviceClient
      .from('communities')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (community.creator_id !== user.id) {
      return NextResponse.json({ error: 'Only the creator can delete this community' }, { status: 403 });
    }

    // Delete community (cascade will handle members)
    const { error: deleteError } = await serviceClient
      .from('communities')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Community delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete community' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Community delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LitterPick/1.0 (https://litterpick.org)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address;
    if (!addr) return null;

    const place = addr.town || addr.city || addr.village || addr.suburb || addr.county;
    return place || null;
  } catch {
    return null;
  }
}
