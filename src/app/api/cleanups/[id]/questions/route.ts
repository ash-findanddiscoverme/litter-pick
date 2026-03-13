import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { moderateContent } from '@/lib/moderation';

export const runtime = 'edge';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const { id: cleanupId } = params;

    const { data: questions, error } = await supabase
      .from('cleanup_questions')
      .select('id, cleanup_id, user_id, question, created_at, is_hidden')
      .eq('cleanup_id', cleanupId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Questions fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    const userIds = Array.from(new Set(questions.map((q) => q.user_id)));
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, avatar_url')
      .in('id', userIds);

    const userMap = new Map((users || []).map((u) => [u.id, u]));

    const questionIds = questions.map((q) => q.id);
    const { data: answers } = await supabase
      .from('cleanup_answers')
      .select('id, question_id, user_id, answer, created_at, is_hidden')
      .in('question_id', questionIds)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    const answerUserIds = Array.from(new Set((answers || []).map((a) => a.user_id)));
    const additionalUserIds = answerUserIds.filter((id) => !userMap.has(id));
    if (additionalUserIds.length > 0) {
      const { data: additionalUsers } = await supabase
        .from('users')
        .select('id, first_name, avatar_url')
        .in('id', additionalUserIds);
      (additionalUsers || []).forEach((u) => userMap.set(u.id, u));
    }

    const answersByQuestion = new Map<string, typeof answers>();
    (answers || []).forEach((a) => {
      const existing = answersByQuestion.get(a.question_id) || [];
      existing.push(a);
      answersByQuestion.set(a.question_id, existing);
    });

    const enrichedQuestions = questions.map((q) => ({
      ...q,
      user: userMap.get(q.user_id) || { id: q.user_id, first_name: 'Unknown', avatar_url: null },
      answers: (answersByQuestion.get(q.id) || []).map((a) => ({
        ...a,
        user: userMap.get(a.user_id) || { id: a.user_id, first_name: 'Unknown', avatar_url: null },
      })),
    }));

    return NextResponse.json({ questions: enrichedQuestions });
  } catch (err) {
    console.error('Questions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();
    const { id: cleanupId } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 10) {
      return NextResponse.json({ error: 'Question must be at least 10 characters' }, { status: 400 });
    }

    if (trimmedQuestion.length > 500) {
      return NextResponse.json({ error: 'Question must be less than 500 characters' }, { status: 400 });
    }

    const moderation = moderateContent(trimmedQuestion);
    if (!moderation.isClean) {
      return NextResponse.json({
        error: 'Your question contains inappropriate content',
        reasons: moderation.reasons,
      }, { status: 400 });
    }

    const { data: cleanup } = await serviceClient
      .from('cleanups')
      .select('id')
      .eq('id', cleanupId)
      .single();

    if (!cleanup) {
      return NextResponse.json({ error: 'Cleanup not found' }, { status: 404 });
    }

    const { data: newQuestion, error: insertError } = await serviceClient
      .from('cleanup_questions')
      .insert({
        cleanup_id: cleanupId,
        user_id: user.id,
        question: trimmedQuestion,
        is_hidden: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Question insert error:', insertError);
      return NextResponse.json({ error: 'Failed to post question' }, { status: 500 });
    }

    const { data: userData } = await serviceClient
      .from('users')
      .select('id, first_name, avatar_url')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      question: {
        ...newQuestion,
        user: userData || { id: user.id, first_name: 'You', avatar_url: null },
        answers: [],
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Post question error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
