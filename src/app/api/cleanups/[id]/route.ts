import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const { id } = params;

    const { data: cleanup, error } = await supabase
      .from('cleanups')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !cleanup) {
      return NextResponse.json({ error: 'Cleanup not found' }, { status: 404 });
    }

    // Fetch associated hotspot
    const { data: hotspot } = await supabase
      .from('hotspots')
      .select('*')
      .eq('id', cleanup.hotspot_id)
      .single();

    // Fetch organiser details
    let organiser = null;
    if (cleanup.organiser_user_id) {
      const { data: org } = await supabase
        .from('users')
        .select('id, first_name, avatar_url')
        .eq('id', cleanup.organiser_user_id)
        .single();
      organiser = org || null;
    }

    // Fetch volunteers who expressed interest in this hotspot
    let volunteers: { id: string; first_name: string; avatar_url: string | null; interest_type: string }[] = [];
    if (cleanup.hotspot_id) {
      const { data: interests } = await supabase
        .from('volunteer_interests')
        .select('user_id, interest_type')
        .eq('hotspot_id', cleanup.hotspot_id);

      if (interests && interests.length > 0) {
        const userIds = interests.map((i: { user_id: string }) => i.user_id);
        const { data: users } = await supabase
          .from('users')
          .select('id, first_name, avatar_url')
          .in('id', userIds);

        if (users) {
          const interestMap = new Map(interests.map((i: { user_id: string; interest_type: string }) => [i.user_id, i.interest_type]));
          volunteers = users.map((u: { id: string; first_name: string; avatar_url: string | null }) => ({
            id: u.id,
            first_name: u.first_name,
            avatar_url: u.avatar_url,
            interest_type: interestMap.get(u.id) || 'join',
          }));
        }
      }
    }

    return NextResponse.json({ cleanup, hotspot: hotspot || null, organiser, volunteers });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
