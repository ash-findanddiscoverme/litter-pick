'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);
      setAuthChecked(true);
    });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-loam">Litter Pick</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/report" className="px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50 transition-colors">
            Report
          </Link>
          <Link href="/map" className="px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50 transition-colors">
            Map
          </Link>
          <Link href="/picks" className="px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50 transition-colors">
            Pick
          </Link>
          <Link href="/guides" className="px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50 transition-colors">
            Guides
          </Link>
          {authChecked && (
            user ? (
              <Link href="/profile">
                <Button variant="secondary" size="sm">Profile</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5 ml-2">
                <Link href="/volunteer">
                  <Button size="sm">Volunteer</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
              </div>
            )
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-weathered" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-3 space-y-1">
          <Link href="/report" className="block px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
            Report
          </Link>
          <Link href="/map" className="block px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
            Map
          </Link>
          <Link href="/picks" className="block px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
            Pick
          </Link>
          <Link href="/guides" className="block px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
            Guides
          </Link>
          {authChecked && (
            user ? (
              <Link href="/profile" className="block px-3 py-2 text-sm font-medium text-brand-500 hover:text-brand-600 rounded-lg hover:bg-brand-50" onClick={() => setMenuOpen(false)}>
                My profile
              </Link>
            ) : (
              <>
                <Link href="/volunteer" className="block px-3 py-2 text-sm font-medium text-brand-500 hover:text-brand-600 rounded-lg hover:bg-brand-50" onClick={() => setMenuOpen(false)}>
                  Volunteer
                </Link>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-weathered hover:text-loam rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
              </>
            )
          )}
        </div>
      )}
    </header>
  );
}
