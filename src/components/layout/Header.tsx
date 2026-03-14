'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/report', label: 'Report' },
  { href: '/map', label: 'Map' },
  { href: '/picks', label: 'Pick' },
  { href: '/communities', label: 'Communities' },
  { href: '/guides', label: 'Guides' },
];

export default function Header() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-soft' 
          : 'bg-white/90 backdrop-blur-md border-b border-stone-100'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 md:h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-glow-brand transition-shadow duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <span className="text-lg font-display font-semibold text-loam">Litter Pick</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
                isActive(link.href)
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-weathered hover:text-loam hover:bg-stone-100'
              )}
            >
              {link.label}
            </Link>
          ))}
          {authChecked && (
            user ? (
              <Link href="/profile" className="ml-2">
                <Button variant="secondary" size="sm">Profile</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5 ml-3">
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
          className="md:hidden p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6 text-loam" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-stone-100 px-4 py-4 space-y-1 animate-slide-down">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={cn(
                'block px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                isActive(link.href)
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-weathered hover:text-loam hover:bg-stone-50'
              )}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-stone-100 mt-3 space-y-2">
            {authChecked && (
              user ? (
                <Link 
                  href="/profile" 
                  className="block px-4 py-3 text-sm font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors" 
                  onClick={() => setMenuOpen(false)}
                >
                  My profile
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link href="/volunteer" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button fullWidth>Volunteer</Button>
                  </Link>
                  <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" fullWidth>Log in</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
