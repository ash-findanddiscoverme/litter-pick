'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface AdminUser {
  id: string;
  first_name: string;
  email: string;
  postcode_or_town: string;
  volunteer_type: string;
  avatar_url: string | null;
  status: string | null;
  warn_reason: string | null;
  ban_reason: string | null;
  warned_at: string | null;
  banned_at: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-50 text-green-700' },
  warned: { label: 'Warned', className: 'bg-amber-50 text-amber-700' },
  banned: { label: 'Banned', className: 'bg-red-50 text-red-700' },
};

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterParam || 'all');
  const [actionModal, setActionModal] = useState<{ user: AdminUser; action: string } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleAction() {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${actionModal.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionModal.action, reason: actionReason }),
      });
      if (res.ok) {
        setActionModal(null);
        setActionReason('');
        await loadUsers();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = users.filter((u) => {
    const userStatus = u.status || 'active';
    if (statusFilter !== 'all' && userStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.first_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.postcode_or_town.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-loam mb-6">Users</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search name, email, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="warned">Warned</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <p className="text-sm text-weathered mb-4">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>

      {/* User list */}
      <div className="space-y-3">
        {filtered.map((u) => {
          const status = u.status || 'active';
          const badge = STATUS_BADGE[status] || STATUS_BADGE.active;
          return (
            <Card key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm shrink-0">
                    {u.first_name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-loam truncate">{u.first_name}</p>
                    <Badge className={badge.className}>{badge.label}</Badge>
                  </div>
                  <p className="text-xs text-weathered truncate">{u.email}</p>
                  <p className="text-xs text-weathered">{u.postcode_or_town} &middot; {u.volunteer_type} &middot; Joined {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  {status === 'warned' && u.warn_reason && (
                    <p className="text-xs text-amber-600 mt-1">Warning: {u.warn_reason}</p>
                  )}
                  {status === 'banned' && u.ban_reason && (
                    <p className="text-xs text-red-600 mt-1">Ban reason: {u.ban_reason}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {status !== 'warned' && status !== 'banned' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    onClick={() => setActionModal({ user: u, action: 'warn' })}
                  >
                    Warn
                  </Button>
                )}
                {status === 'warned' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => setActionModal({ user: u, action: 'clear_warning' })}
                  >
                    Clear warning
                  </Button>
                )}
                {status !== 'banned' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setActionModal({ user: u, action: 'ban' })}
                  >
                    Ban
                  </Button>
                )}
                {status === 'banned' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => setActionModal({ user: u, action: 'unban' })}
                  >
                    Unban
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-weathered py-12">No users match your search.</p>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => { setActionModal(null); setActionReason(''); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-loam mb-1">
              {actionModal.action === 'warn' && 'Warn user'}
              {actionModal.action === 'ban' && 'Ban user'}
              {actionModal.action === 'unban' && 'Unban user'}
              {actionModal.action === 'clear_warning' && 'Clear warning'}
            </h2>
            <p className="text-sm text-weathered mb-4">
              {actionModal.action === 'warn' && `Send a warning to ${actionModal.user.first_name}. They will see this on their profile.`}
              {actionModal.action === 'ban' && `Ban ${actionModal.user.first_name} from the platform. They will not be able to log in.`}
              {actionModal.action === 'unban' && `Remove the ban on ${actionModal.user.first_name}'s account and restore their access.`}
              {actionModal.action === 'clear_warning' && `Remove the warning from ${actionModal.user.first_name}'s account.`}
            </p>

            {(actionModal.action === 'warn' || actionModal.action === 'ban') && (
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason (optional, visible to user)..."
                rows={3}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent mb-4 resize-none"
              />
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setActionModal(null); setActionReason(''); }}>
                Cancel
              </Button>
              <Button
                variant={actionModal.action === 'ban' ? 'danger' : 'primary'}
                size="sm"
                loading={submitting}
                onClick={handleAction}
              >
                {actionModal.action === 'warn' && 'Send warning'}
                {actionModal.action === 'ban' && 'Confirm ban'}
                {actionModal.action === 'unban' && 'Unban'}
                {actionModal.action === 'clear_warning' && 'Clear warning'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
