import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const VALID_ITEMS = ['equipment_bags', 'equipment_bag_hoop', 'equipment_gloves', 'equipment_litter_picker'];
const VALID_STATUSES = ['own', 'dont_need', 'borrow', null];

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Validate and filter to only valid equipment fields
    const updates: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(body)) {
      if (VALID_ITEMS.includes(key) && VALID_STATUSES.includes(value as string | null)) {
        updates[key] = value as string | null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid equipment fields provided' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select('equipment_bags, equipment_bag_hoop, equipment_gloves, equipment_litter_picker')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
