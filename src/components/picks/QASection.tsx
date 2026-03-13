'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import type { QuestionWithAnswers } from '@/types/database';

interface QASectionProps {
  cleanupId: string;
  questions: QuestionWithAnswers[];
  currentUserId: string | null;
  isOrganiser: boolean;
  isParticipant: boolean;
  onQuestionsUpdate: (questions: QuestionWithAnswers[]) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function Avatar({ user }: { user: { first_name: string; avatar_url: string | null } }) {
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.first_name}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
      <span className="text-xs font-bold text-stone-400">
        {user.first_name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function QASection({
  cleanupId,
  questions,
  currentUserId,
  isOrganiser,
  isParticipant,
  onQuestionsUpdate,
}: QASectionProps) {
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState('');

  const canAnswer = isOrganiser || isParticipant;

  const handleSubmitQuestion = useCallback(async () => {
    if (!newQuestion.trim() || !currentUserId) return;

    setSubmittingQuestion(true);
    setQuestionError('');

    try {
      const res = await fetch(`/api/cleanups/${cleanupId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setQuestionError(data.error || 'Failed to post question');
        setSubmittingQuestion(false);
        return;
      }

      onQuestionsUpdate([...questions, data.question]);
      setNewQuestion('');
      setShowAskForm(false);
    } catch {
      setQuestionError('Something went wrong');
    }
    setSubmittingQuestion(false);
  }, [cleanupId, newQuestion, currentUserId, questions, onQuestionsUpdate]);

  const handleSubmitAnswer = useCallback(async (questionId: string) => {
    if (!newAnswer.trim() || !currentUserId) return;

    setSubmittingAnswer(true);
    setAnswerError('');

    try {
      const res = await fetch(`/api/cleanups/${cleanupId}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: newAnswer.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnswerError(data.error || 'Failed to post answer');
        setSubmittingAnswer(false);
        return;
      }

      const updatedQuestions = questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, answers: [...q.answers, data.answer] };
        }
        return q;
      });
      onQuestionsUpdate(updatedQuestions);
      setNewAnswer('');
      setReplyingTo(null);
    } catch {
      setAnswerError('Something went wrong');
    }
    setSubmittingAnswer(false);
  }, [cleanupId, newAnswer, currentUserId, questions, onQuestionsUpdate]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-weathered uppercase tracking-wide">
          Questions ({questions.length})
        </h3>
        {currentUserId && !showAskForm && (
          <button
            onClick={() => setShowAskForm(true)}
            className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
          >
            Ask a question
          </button>
        )}
      </div>

      {showAskForm && (
        <div className="mb-4 p-3 bg-stone-50 rounded-xl">
          <Textarea
            id="new-question"
            label="Your question"
            placeholder="What would you like to know about this pick?"
            rows={2}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-stone-400 mt-1 mb-3">
            {newQuestion.length}/500 characters
          </p>
          {questionError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{questionError}</p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAskForm(false);
                setNewQuestion('');
                setQuestionError('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitQuestion}
              disabled={submittingQuestion || newQuestion.trim().length < 10}
              loading={submittingQuestion}
            >
              Post question
            </Button>
          </div>
        </div>
      )}

      {questions.length === 0 && !showAskForm && (
        <p className="text-sm text-stone-400 text-center py-4">
          No questions yet. Be the first to ask!
        </p>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="border-b border-stone-100 last:border-0 pb-4 last:pb-0">
            <div className="flex gap-3">
              <Avatar user={q.user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-loam">{q.user.first_name}</span>
                  <span className="text-xs text-stone-400">{formatTimeAgo(q.created_at)}</span>
                </div>
                <p className="text-sm text-loam mt-1">{q.question}</p>

                {q.answers.length > 0 && (
                  <div className="mt-3 space-y-3 pl-4 border-l-2 border-brand-100">
                    {q.answers.map((a) => (
                      <div key={a.id} className="flex gap-2">
                        <Avatar user={a.user} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-loam">{a.user.first_name}</span>
                            <span className="text-xs text-stone-400">{formatTimeAgo(a.created_at)}</span>
                          </div>
                          <p className="text-sm text-loam mt-0.5">{a.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canAnswer && replyingTo !== q.id && (
                  <button
                    onClick={() => {
                      setReplyingTo(q.id);
                      setNewAnswer('');
                      setAnswerError('');
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600 mt-2 transition-colors"
                  >
                    Reply
                  </button>
                )}

                {replyingTo === q.id && (
                  <div className="mt-3 p-3 bg-brand-50 rounded-xl">
                    <Textarea
                      id={`answer-${q.id}`}
                      label="Your answer"
                      placeholder="Write your reply..."
                      rows={2}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      maxLength={1000}
                    />
                    <p className="text-xs text-stone-400 mt-1 mb-3">
                      {newAnswer.length}/1000 characters
                    </p>
                    {answerError && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{answerError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewAnswer('');
                          setAnswerError('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitAnswer(q.id)}
                        disabled={submittingAnswer || newAnswer.trim().length < 5}
                        loading={submittingAnswer}
                      >
                        Post reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!currentUserId && (
        <div className="mt-4 p-3 bg-stone-50 rounded-xl text-center">
          <p className="text-sm text-stone-500">
            <a href="/login" className="text-brand-500 font-medium hover:underline">Sign in</a>
            {' '}to ask a question
          </p>
        </div>
      )}
    </Card>
  );
}
