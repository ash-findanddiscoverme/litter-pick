'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import type { VolunteerType, ProfilePanelKey } from '@/types/database';

const PANEL_OPTIONS: { key: ProfilePanelKey; label: string; description: string }[] = [
  { key: 'show_stats', label: 'Stats', description: 'Cleanups joined, completed, and areas helped' },
  { key: 'show_area', label: 'Volunteer area', description: 'Map showing where you volunteer' },
  { key: 'show_equipment', label: 'Equipment', description: 'What kit you own or need' },
  { key: 'show_picks', label: 'Picks', description: 'Litter picks you organised or joined' },
  { key: 'show_reports', label: 'Reports', description: 'Photos of litter you reported' },
  { key: 'show_communities', label: 'Communities', description: 'Communities you belong to' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [volunteerType, setVolunteerType] = useState<VolunteerType>('solo');
  const [originalType, setOriginalType] = useState<VolunteerType>('solo');
  const [savingType, setSavingType] = useState(false);
  const [typeSuccess, setTypeSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Panel visibility
  const [panels, setPanels] = useState<Record<ProfilePanelKey, boolean>>({
    show_stats: true,
    show_area: true,
    show_equipment: true,
    show_picks: true,
    show_reports: true,
    show_communities: true,
  });
  const [savingPanels, setSavingPanels] = useState(false);
  const [panelsSuccess, setPanelsSuccess] = useState(false);

  // Volunteer area privacy
  const [areaVisible, setAreaVisible] = useState(true);
  const [savingAreaVisibility, setSavingAreaVisibility] = useState(false);
  const [areaVisibilitySuccess, setAreaVisibilitySuccess] = useState(false);

  // Profile slug
  const [profileSlug, setProfileSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [savingSlug, setSavingSlug] = useState(false);
  const [slugSuccess, setSlugSuccess] = useState(false);
  const [slugError, setSlugError] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data?.user) {
          const u = data.user;
          setVolunteerType(u.volunteer_type || 'solo');
          setOriginalType(u.volunteer_type || 'solo');
          setPanels({
            show_stats: u.show_stats !== false,
            show_area: u.show_area !== false,
            show_equipment: u.show_equipment !== false,
            show_picks: u.show_picks !== false,
            show_reports: u.show_reports !== false,
            show_communities: u.show_communities !== false,
          });
          setAreaVisible(u.area_visible !== false);
          setProfileSlug(u.profile_slug || '');
          setOriginalSlug(u.profile_slug || '');
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load settings'); setLoading(false); });
  }, [router]);

  const handleSaveType = async () => {
    setSavingType(true); setTypeSuccess(false); setError('');
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_type: volunteerType }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update'); }
      setOriginalType(volunteerType);
      setTypeSuccess(true);
      setTimeout(() => setTypeSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setSavingType(false); }
  };

  const handleSavePanels = async () => {
    setSavingPanels(true); setPanelsSuccess(false);
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(panels),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update'); }
      setPanelsSuccess(true);
      setTimeout(() => setPanelsSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setSavingPanels(false); }
  };

  const handleToggleAreaVisibility = async () => {
    setSavingAreaVisibility(true); setAreaVisibilitySuccess(false);
    const newValue = !areaVisible;
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_visible: newValue }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update'); }
      setAreaVisible(newValue);
      setAreaVisibilitySuccess(true);
      setTimeout(() => setAreaVisibilitySuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setSavingAreaVisibility(false); }
  };

  const handleSaveSlug = async () => {
    setSavingSlug(true); setSlugSuccess(false); setSlugError('');
    const slug = profileSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (slug.length < 3) { setSlugError('Must be at least 3 characters'); setSavingSlug(false); return; }
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_slug: slug }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update'); }
      setProfileSlug(slug);
      setOriginalSlug(slug);
      setSlugSuccess(true);
      setTimeout(() => setSlugSuccess(false), 3000);
    } catch (err) {
      setSlugError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setSavingSlug(false); }
  };

  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordSuccess(false);
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to change password'); }
      setNewPassword(''); setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setSavingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/settings', { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to delete account'); }
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile')} className="text-weathered hover:text-loam transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-loam">Settings</h1>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

          {/* Profile URL */}
          <Card>
            <h3 className="text-sm font-semibold text-loam mb-1">Profile URL</h3>
            <p className="text-xs text-weathered mb-3">
              Set a custom URL so others can find your profile. Only logged-in users can view profiles.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-400 whitespace-nowrap">litterpick.org/user/</span>
              <input
                type="text"
                value={profileSlug}
                onChange={(e) => { setProfileSlug(e.target.value); setSlugError(''); setSlugSuccess(false); }}
                placeholder="your-name"
                maxLength={40}
                className="flex-1 min-w-0 rounded-xl border border-stone-200 px-3 py-2 text-sm text-loam placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
            {slugError && <p className="text-xs text-red-600 mt-1">{slugError}</p>}
            <div className="mt-3 flex items-center gap-3">
              <Button size="sm" onClick={handleSaveSlug} loading={savingSlug} disabled={profileSlug === originalSlug || profileSlug.length < 3}>
                Save
              </Button>
              {slugSuccess && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </Card>

          {/* Profile panels */}
          <Card>
            <h3 className="text-sm font-semibold text-loam mb-1">Profile panels</h3>
            <p className="text-xs text-weathered mb-4">
              Choose which sections appear on your profile. Hidden panels won&apos;t be visible to other users.
            </p>
            <div className="space-y-3">
              {PANEL_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={panels[opt.key]}
                      onChange={() => {
                        setPanels((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }));
                        setPanelsSuccess(false);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-200 rounded-full peer-checked:bg-brand-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-loam">{opt.label}</p>
                    <p className="text-xs text-weathered">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button size="sm" onClick={handleSavePanels} loading={savingPanels}>
                Save panels
              </Button>
              {panelsSuccess && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Updated
                </span>
              )}
            </div>
          </Card>

          {/* Volunteer area privacy */}
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-loam mb-1">Volunteer area visibility</h3>
                <p className="text-xs text-weathered">
                  {areaVisible
                    ? 'Your volunteer area is visible to other logged-in users on your profile.'
                    : 'Your volunteer area is hidden from other users.'}
                </p>
              </div>
              <button
                onClick={handleToggleAreaVisibility}
                disabled={savingAreaVisibility}
                className="relative flex-shrink-0 mt-0.5"
              >
                <div className={`w-11 h-6 rounded-full transition-colors ${areaVisible ? 'bg-brand-500' : 'bg-stone-200'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${areaVisible ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {areaVisibilitySuccess && (
              <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Updated
              </p>
            )}
          </Card>

          {/* Volunteer type */}
          <Card>
            <h3 className="text-sm font-semibold text-loam mb-3">Volunteer status</h3>
            <p className="text-xs text-weathered mb-3">Choose how you want to participate in litter picks.</p>
            <Select
              id="volunteer-type"
              value={volunteerType}
              onChange={(e) => { setVolunteerType(e.target.value as VolunteerType); setTypeSuccess(false); }}
              options={[
                { value: 'solo', label: 'Solo volunteer' },
                { value: 'group', label: 'Group volunteer' },
                { value: 'organise', label: 'Organiser' },
              ]}
            />
            <div className="mt-3 flex items-center gap-3">
              <Button size="sm" onClick={handleSaveType} loading={savingType} disabled={volunteerType === originalType}>Save</Button>
              {typeSuccess && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Updated
                </span>
              )}
            </div>
          </Card>

          {/* Change password */}
          <Card>
            <h3 className="text-sm font-semibold text-loam mb-3">Change password</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="block text-sm font-medium text-stone-400">New password</label>
                <input
                  id="new-password" type="password" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); setPasswordSuccess(false); }}
                  placeholder="At least 6 characters"
                  className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-loam placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent hover:border-stone-300 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-400">Confirm password</label>
                <input
                  id="confirm-password" type="password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); setPasswordSuccess(false); }}
                  placeholder="Type it again"
                  className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-loam placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent hover:border-stone-300 transition-colors"
                />
              </div>
              {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleChangePassword} loading={savingPassword} disabled={!newPassword || !confirmPassword}>Change password</Button>
                {passwordSuccess && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Password changed
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Delete account */}
          <Card className="border-red-100">
            <h3 className="text-sm font-semibold text-red-700 mb-2">Delete account</h3>
            <p className="text-xs text-weathered mb-3">
              This will permanently delete your account, reports, and volunteer data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete my account</Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="delete-confirm" className="block text-xs font-medium text-red-600">Type DELETE to confirm</label>
                  <input
                    id="delete-confirm" type="text" value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="block w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm text-loam placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>Cancel</Button>
                  <Button variant="danger" size="sm" onClick={handleDeleteAccount} loading={deleting} disabled={deleteConfirmText !== 'DELETE'}>Permanently delete</Button>
                </div>
              </div>
            )}
          </Card>

          <button onClick={() => router.push('/profile')} className="w-full text-sm text-brand-500 hover:text-brand-600 font-medium text-center py-2">
            Back to profile
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
