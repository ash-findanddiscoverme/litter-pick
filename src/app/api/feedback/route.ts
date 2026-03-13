import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { moderateContent } from '@/lib/moderation';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { message, page_url, email } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      return NextResponse.json({ error: 'Please provide more detail (at least 10 characters)' }, { status: 400 });
    }

    if (trimmedMessage.length > 2000) {
      return NextResponse.json({ error: 'Message must be less than 2000 characters' }, { status: 400 });
    }

    const moderation = moderateContent(trimmedMessage);
    if (!moderation.isClean) {
      return NextResponse.json({
        error: 'Your feedback contains inappropriate content',
        reasons: moderation.reasons,
      }, { status: 400 });
    }

    const { data: feedback, error: insertError } = await serviceClient
      .from('feedback')
      .insert({
        user_id: user?.id || null,
        page_url: page_url || null,
        message: trimmedMessage,
        email: email || null,
        status: 'new',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Feedback insert error:', insertError);
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (err) {
    console.error('Feedback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
