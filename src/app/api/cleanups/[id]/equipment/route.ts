import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is the organiser
    const { data: cleanup } = await serviceClient
      .from('cleanups')
      .select('organiser_user_id')
      .eq('id', id)
      .single();

    if (!cleanup || cleanup.organiser_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the organiser can update equipment' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      'equipment_provision',
      'equipment_bags_confirmed',
      'equipment_hoops_confirmed',
      'equipment_gloves_confirmed',
      'equipment_pickers_confirmed',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { error: updateError } = await serviceClient
      .from('cleanups')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Equipment update error:', updateError);
      return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Equipment API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
