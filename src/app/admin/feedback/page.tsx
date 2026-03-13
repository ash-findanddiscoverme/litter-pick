'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import type { Feedback, FeedbackStatus } from '@/types/database';

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-50' },
  reviewed: { label: 'Reviewed', color: 'text-amber-700', bg: 'bg-amber-50' },
  actioned: { label: 'Actioned', color: 'text-green-700', bg: 'bg-green-50' },
  archived: { label: 'Archived', color: 'text-gray-700', bg: 'bg-gray-100' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('all');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      const res = await fetch('/api/admin/feedback');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setFeedback(data.feedback || []);
    } catch {
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }

  async function updateFeedback(id: string, updates: { status?: FeedbackStatus; admin_notes?: string }) {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? data.feedback : f))
      );
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(data.feedback);
      }
    } catch {
      setError('Failed to update feedback');
    } finally {
      setUpdating(false);
    }
  }

  const filteredFeedback = filter === 'all'
    ? feedback
    : feedback.filter((f) => f.status === filter);

  const counts = {
    all: feedback.length,
    new: feedback.filter((f) => f.status === 'new').length,
    reviewed: feedback.filter((f) => f.status === 'reviewed').length,
    actioned: feedback.filter((f) => f.status === 'actioned').length,
    archived: feedback.filter((f) => f.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && feedback.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
        <button onClick={loadFeedback} className="mt-4 text-brand-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-loam">Feedback</h1>
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'reviewed', 'actioned', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-stone-100 text-weathered hover:bg-stone-200'
              }`}
            >
              {status === 'all' ? 'All' : STATUS_CONFIG[status].label}
              <span className="ml-1.5 text-xs opacity-75">({counts[status]})</span>
            </button>
          ))}
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <Card>
          <p className="text-center text-weathered py-8">
            {filter === 'all' ? 'No feedback yet.' : `No ${STATUS_CONFIG[filter as FeedbackStatus].label.toLowerCase()} feedback.`}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Feedback list */}
          <div className="space-y-3">
            {filteredFeedback.map((item) => {
              const statusConfig = STATUS_CONFIG[item.status];
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className="cursor-pointer"
                >
                  <Card
                    className={`transition-shadow hover:shadow-md ${
                      selectedFeedback?.id === item.id ? 'ring-2 ring-brand-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-loam line-clamp-2">{item.message}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-weathered">
                          <span>{formatDate(item.created_at)}</span>
                          {item.page_url && (
                            <>
                              <span className="text-stone-300">|</span>
                              <span className="truncate max-w-[150px]">{item.page_url}</span>
                            </>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedFeedback && (
            <div className="lg:sticky lg:top-4">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-loam">Feedback Details</h2>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-weathered hover:text-loam text-sm"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-weathered uppercase tracking-wide mb-1">Message</p>
                    <p className="text-sm text-loam whitespace-pre-wrap">{selectedFeedback.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-weathered uppercase tracking-wide mb-1">Submitted</p>
                      <p className="text-sm text-loam">{formatDate(selectedFeedback.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-weathered uppercase tracking-wide mb-1">Page</p>
                      <p className="text-sm text-loam break-all">{selectedFeedback.page_url || 'N/A'}</p>
                    </div>
                  </div>

                  {selectedFeedback.email && (
                    <div>
                      <p className="text-xs font-medium text-weathered uppercase tracking-wide mb-1">Email</p>
                      <a
                        href={`mailto:${selectedFeedback.email}`}
                        className="text-sm text-brand-600 hover:underline"
                      >
                        {selectedFeedback.email}
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-weathered uppercase tracking-wide mb-2">Status</p>
                    <div className="flex flex-wrap gap-2">
                      {(['new', 'reviewed', 'actioned', 'archived'] as FeedbackStatus[]).map((status) => {
                        const config = STATUS_CONFIG[status];
                        const isActive = selectedFeedback.status === status;
                        return (
                          <button
                            key={status}
                            onClick={() => updateFeedback(selectedFeedback.id, { status })}
                            disabled={updating || isActive}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              isActive
                                ? `${config.bg} ${config.color} ring-2 ring-offset-1 ring-current`
                                : 'bg-stone-100 text-weathered hover:bg-stone-200'
                            } disabled:opacity-50`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-weathered uppercase tracking-wide mb-2">Admin Notes</p>
                    <textarea
                      defaultValue={selectedFeedback.admin_notes || ''}
                      placeholder="Add internal notes..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value !== (selectedFeedback.admin_notes || '')) {
                          updateFeedback(selectedFeedback.id, { admin_notes: value || null });
                        }
                      }}
                    />
                  </div>

                  {selectedFeedback.reviewed_at && (
                    <p className="text-xs text-weathered">
                      Reviewed: {formatDate(selectedFeedback.reviewed_at)}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
