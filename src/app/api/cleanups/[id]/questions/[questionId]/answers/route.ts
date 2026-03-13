import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { moderateContent } from '@/lib/moderation';

export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();
    const { id: cleanupId, questionId } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { answer } = body;

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
    }

    const trimmedAnswer = answer.trim();
    if (trimmedAnswer.length < 5) {
      return NextResponse.json({ error: 'Answer must be at least 5 characters' }, { status: 400 });
    }

    if (trimmedAnswer.length > 1000) {
      return NextResponse.json({ error: 'Answer must be less than 1000 characters' }, { status: 400 });
    }

    const moderation = moderateContent(trimmedAnswer);
    if (!moderation.isClean) {
      return NextResponse.json({
        error: 'Your answer contains inappropriate content',
        reasons: moderation.reasons,
      }, { status: 400 });
    }

    const { data: question } = await serviceClient
      .from('cleanup_questions')
      .select('id, cleanup_id')
      .eq('id', questionId)
      .eq('cleanup_id', cleanupId)
      .single();

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const { data: cleanup } = await serviceClient
      .from('cleanups')
      .select('organiser_user_id, hotspot_id')
      .eq('id', cleanupId)
      .single();

    if (!cleanup) {
      return NextResponse.json({ error: 'Cleanup not found' }, { status: 404 });
    }

    const isOrganiser = cleanup.organiser_user_id === user.id;

    let isParticipant = false;
    if (!isOrganiser && cleanup.hotspot_id) {
      const { data: interest } = await serviceClient
        .from('volunteer_interests')
        .select('id')
        .eq('hotspot_id', cleanup.hotspot_id)
        .eq('user_id', user.id)
        .single();
      isParticipant = !!interest;
    }

    if (!isOrganiser && !isParticipant) {
      return NextResponse.json({
        error: 'Only the organiser or participants can answer questions',
      }, { status: 403 });
    }

    const { data: newAnswer, error: insertError } = await serviceClient
      .from('cleanup_answers')
      .insert({
        question_id: questionId,
        user_id: user.id,
        answer: trimmedAnswer,
        is_hidden: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Answer insert error:', insertError);
      return NextResponse.json({ error: 'Failed to post answer' }, { status: 500 });
    }

    const { data: userData } = await serviceClient
      .from('users')
      .select('id, first_name, avatar_url')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      answer: {
        ...newAnswer,
        user: userData || { id: user.id, first_name: 'You', avatar_url: null },
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Post answer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
