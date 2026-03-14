import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

/** GET /api/communities — list communities with optional proximity sort */
export async function GET(request: NextRequest) {
  try {
    const serviceClient = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Try to get current user for membership info
    let currentUserId: string | null = null;
    try {
      const authClient = createServerSupabaseClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) currentUserId = user.id;
    } catch {
      // Not logged in
    }

    let communities;

    // Use RPC for proximity search if coordinates provided
    if (lat && lng) {
      const { data, error } = await serviceClient.rpc('find_nearby_communities', {
        target_lat: parseFloat(lat),
        target_lng: parseFloat(lng),
        radius_km: 100,
      });

      if (error) {
        console.error('Proximity search error:', error);
        return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
      }
      communities = data;
    } else {
      // Fallback to regular query
      const { data, error } = await serviceClient
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Communities fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
      }
      communities = data;
    }

    if (!communities || communities.length === 0) {
      return NextResponse.json({ communities: [] });
    }

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      communities = communities.filter(
        (c: { name: string; description: string | null; area_name: string | null }) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.area_name?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch member counts
    const communityIds = communities.map((c: { id: string }) => c.id);
    
    const { data: memberCounts } = await serviceClient
      .from('community_members')
      .select('community_id')
      .in('community_id', communityIds);

    const countMap = new Map<string, number>();
    (memberCounts || []).forEach((m: { community_id: string }) => {
      countMap.set(m.community_id, (countMap.get(m.community_id) || 0) + 1);
    });

    // Fetch user's memberships if logged in
    let userMemberships = new Map<string, string>();
    if (currentUserId) {
      const { data: memberships } = await serviceClient
        .from('community_members')
        .select('community_id, role')
        .eq('user_id', currentUserId)
        .in('community_id', communityIds);

      (memberships || []).forEach((m: { community_id: string; role: string }) => {
        userMemberships.set(m.community_id, m.role);
      });
    }

    // Fetch creator info
    const creatorIds = Array.from(new Set(communities.map((c: { creator_id: string }) => c.creator_id)));
    const { data: creators } = await serviceClient
      .from('users')
      .select('id, first_name, avatar_url')
      .in('id', creatorIds);

    const creatorMap = new Map((creators || []).map((c: { id: string; first_name: string; avatar_url: string | null }) => [c.id, c]));

    // Enrich communities with metadata
    const enrichedCommunities = communities.map((c: {
      id: string;
      name: string;
      description: string | null;
      photo_url: string | null;
      creator_id: string;
      center_lat: number;
      center_lng: number;
      radius_km: number;
      area_name: string | null;
      created_at: string;
    }) => ({
      ...c,
      member_count: countMap.get(c.id) || 0,
      is_member: userMemberships.has(c.id),
      user_role: userMemberships.get(c.id) || null,
      creator: creatorMap.get(c.creator_id) || null,
    }));

    return NextResponse.json({ communities: enrichedCommunities });
  } catch (err) {
    console.error('Communities error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/communities — create a new community (auth required) */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const center_lat = parseFloat(formData.get('center_lat') as string);
    const center_lng = parseFloat(formData.get('center_lng') as string);
    const radius_km = parseFloat(formData.get('radius_km') as string);
    const image = formData.get('photo') as File | null;

    if (!name || !center_lat || !center_lng || !radius_km) {
      return NextResponse.json({ error: 'Name, location, and radius are required' }, { status: 400 });
    }

    if (name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: 'Name must be between 3 and 100 characters' }, { status: 400 });
    }

    if (radius_km < 0.5 || radius_km > 50) {
      return NextResponse.json({ error: 'Radius must be between 0.5 and 50 km' }, { status: 400 });
    }

    // Upload photo if provided
    let photo_url: string | null = null;
    if (image) {
      const fileName = `communities/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { data: uploadData, error: uploadError } = await serviceClient.storage
        .from('community-photos')
        .upload(fileName, buffer, {
          contentType: image.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
      } else {
        const { data: publicUrl } = serviceClient.storage
          .from('community-photos')
          .getPublicUrl(uploadData.path);
        photo_url = publicUrl.publicUrl;
      }
    }

    // Reverse geocode to get area name
    const area_name = await reverseGeocode(center_lat, center_lng);

    // Create the community
    const { data: community, error: insertError } = await serviceClient
      .from('communities')
      .insert({
        name,
        description: description || null,
        photo_url,
        creator_id: user.id,
        center_lat,
        center_lng,
        radius_km,
        area_name,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Community creation error:', insertError);
      return NextResponse.json({ error: 'Failed to create community' }, { status: 500 });
    }

    // Add creator as admin member
    const { error: memberError } = await serviceClient
      .from('community_members')
      .insert({
        community_id: community.id,
        user_id: user.id,
        role: 'admin',
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
      // Rollback community creation
      await serviceClient.from('communities').delete().eq('id', community.id);
      return NextResponse.json({ error: 'Failed to create community membership' }, { status: 500 });
    }

    return NextResponse.json({ community }, { status: 201 });
  } catch (err) {
    console.error('Community creation error:', err);
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
