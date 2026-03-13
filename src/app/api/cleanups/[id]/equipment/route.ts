import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: cleanup } = await serviceClient
      .from('cleanups')
      .select('organiser_user_id')
      .eq('id', id)
      .single();

    if (!cleanup) {
      return NextResponse.json({ error: 'Cleanup not found' }, { status: 404 });
    }

    const isOrganiser = cleanup.organiser_user_id === user.id;

    const body = await request.json();

    // Organiser-only fields
    if (isOrganiser) {
      const organiserFields = [
        'equipment_provision',
        'equipment_bags_confirmed',
        'equipment_hoops_confirmed',
        'equipment_gloves_confirmed',
        'equipment_pickers_confirmed',
        'meet_lat',
        'meet_lng',
        'meet_instructions',
        'proposed_time',
      ];

      const updates: Record<string, unknown> = {};
      for (let i = 0; i < organiserFields.length; i++) {
        const field = organiserFields[i];
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await serviceClient
          .from('cleanups')
          .update(updates)
          .eq('id', id);

        if (updateError) {
          console.error('Equipment update error:', updateError);
          return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        }
      }
    }

    // Equipment request from any participant
    if (body.equipment_request) {
      const { item_type, action } = body.equipment_request;
      const validTypes = ['bags', 'hoops', 'gloves', 'pickers'];
      if (!validTypes.includes(item_type)) {
        return NextResponse.json({ error: 'Invalid equipment type' }, { status: 400 });
      }

      if (action === 'request') {
        await serviceClient
          .from('equipment_requests')
          .upsert({
            cleanup_id: id,
            user_id: user.id,
            item_type,
            status: 'requested',
          }, { onConflict: 'cleanup_id,user_id,item_type' });
      } else if (action === 'cancel') {
        await serviceClient
          .from('equipment_requests')
          .delete()
          .eq('cleanup_id', id)
          .eq('user_id', user.id)
          .eq('item_type', item_type);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Equipment API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const serviceClient = createServiceRoleClient();

    const { data: requests } = await serviceClient
      .from('equipment_requests')
      .select('id, cleanup_id, user_id, item_type, status, created_at')
      .eq('cleanup_id', id)
      .eq('status', 'requested');

    return NextResponse.json({ requests: requests || [] });
  } catch (err) {
    console.error('Equipment GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
