'use client';

import { useState } from 'react';
import Link from 'next/link';
import FeedbackModal from '@/components/feedback/FeedbackModal';

const footerLinks = {
  main: [
    { href: '/donate', label: 'Donate' },
    { href: '/guides', label: 'Guides' },
    { href: '/about', label: 'About' },
  ],
  legal: [
    { href: '/terms', label: 'Terms' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/community-guidelines', label: 'Guidelines' },
    { href: '/cookies', label: 'Cookies' },
  ],
};

export default function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      {/* Feedback banner */}
      <div className="bg-gradient-to-r from-brand-50 to-moss-50 border-t border-brand-100/50">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center justify-center gap-3 w-full group"
          >
            <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-soft transition-shadow">
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 21.192a5.971 5.971 0 01-2.743-.825 4.502 4.502 0 01-.213-7.485A8.258 8.258 0 012.25 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </span>
            <span className="text-sm font-medium text-loam group-hover:text-brand-600 transition-colors">
              Have feedback? Let us know how we can improve
            </span>
          </button>
        </div>
      </div>

      <footer className="bg-stone-50 border-t border-stone-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 md:py-10">
          {/* Mobile: Simplified layout */}
          <div className="flex flex-col gap-6 sm:hidden">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <span className="text-base font-display font-semibold text-loam">Litter Pick</span>
            </Link>
            
            {/* Links - horizontal on mobile */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {[...footerLinks.main, ...footerLinks.legal].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-sm text-weathered hover:text-brand-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Copyright */}
            <p className="text-xs text-stone-400">
              &copy; {new Date().getFullYear()} Litter Pick
            </p>
          </div>

          {/* Desktop: Full layout */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <span className="text-lg font-display font-semibold text-loam">Litter Pick</span>
              </Link>
              <p className="mt-3 text-sm text-weathered max-w-xs leading-relaxed">
                A community-driven platform helping people report litter, organise cleanups, and care for their local areas.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-display font-semibold text-loam mb-3 text-sm">Explore</h4>
              <ul className="space-y-2">
                {footerLinks.main.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-weathered hover:text-brand-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-semibold text-loam mb-3 text-sm">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-weathered hover:text-brand-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar - desktop only */}
          <div className="hidden sm:flex mt-8 pt-5 border-t border-stone-200 items-center justify-between">
            <p className="text-sm text-stone-400">
              &copy; {new Date().getFullYear()} Litter Pick. Made with care for the environment.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 text-xs font-medium rounded-full">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-gentle-pulse" />
              Active across the UK
            </span>
          </div>
        </div>
      </footer>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
