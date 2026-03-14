'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { CommunityMemberWithUser, CommunityMemberRole } from '@/types/database';

interface MemberListProps {
  members: CommunityMemberWithUser[];
  creatorId: string;
  currentUserId: string | null;
  currentUserRole: CommunityMemberRole | null;
  communityId: string;
  onMemberUpdate?: () => void;
}

export default function MemberList({
  members,
  creatorId,
  currentUserId,
  currentUserRole,
  communityId,
  onMemberUpdate,
}: MemberListProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isAdmin = currentUserRole === 'admin';

  const handleRoleChange = async (userId: string, newRole: CommunityMemberRole) => {
    setUpdating(userId);
    setError('');

    try {
      const res = await fetch(`/api/communities/${communityId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update role');
      }

      onMemberUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setUpdating(userId);
    setError('');

    try {
      const res = await fetch(`/api/communities/${communityId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      onMemberUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {members.map((member) => {
        const isCreator = member.user_id === creatorId;
        const isSelf = member.user_id === currentUserId;
        const canManage = isAdmin && !isCreator && !isSelf;

        return (
          <div
            key={member.user_id}
            className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              {member.user.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt={member.user.first_name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center ring-2 ring-white">
                  <span className="text-sm font-bold text-brand-600">
                    {member.user.first_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/user/${member.user_id}`} className="font-medium text-loam truncate hover:text-brand-600 transition-colors">
                    {member.user.first_name}
                  </Link>
                  {isSelf && (
                    <span className="text-xs text-weathered">(you)</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {isCreator ? (
                    <Badge variant="accent">Creator</Badge>
                  ) : member.role === 'admin' ? (
                    <Badge variant="success">Admin</Badge>
                  ) : (
                    <Badge>Member</Badge>
                  )}
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-2">
                {member.role === 'member' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRoleChange(member.user_id, 'admin')}
                    disabled={updating === member.user_id}
                  >
                    Make admin
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRoleChange(member.user_id, 'member')}
                    disabled={updating === member.user_id}
                  >
                    Remove admin
                  </Button>
                )}
                <button
                  onClick={() => handleRemove(member.user_id)}
                  disabled={updating === member.user_id}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove member"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {members.length === 0 && (
        <p className="text-center text-weathered py-6">No members yet</p>
      )}
    </div>
  );
}
