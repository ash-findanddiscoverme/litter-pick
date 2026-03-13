'use client';

import { useState } from 'react';
import Link from 'next/link';
import FeedbackModal from '@/components/feedback/FeedbackModal';

export default function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <div className="bg-stone-50 border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center justify-center gap-2 w-full text-sm text-weathered hover:text-loam transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 21.192a5.971 5.971 0 01-2.743-.825 4.502 4.502 0 01-.213-7.485A8.258 8.258 0 012.25 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span>Have feedback? Let us know how we can improve</span>
          </button>
        </div>
      </div>

      <footer className="border-t border-stone-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-weathered">
            <Link href="/donate" className="hover:text-loam transition-colors">Donate</Link>
            <Link href="/guides" className="hover:text-loam transition-colors">Guides</Link>
            <Link href="/about" className="hover:text-loam transition-colors">About</Link>
            <Link href="/terms" className="hover:text-loam transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-loam transition-colors">Privacy</Link>
            <Link href="/community-guidelines" className="hover:text-loam transition-colors">Guidelines</Link>
            <Link href="/reporting" className="hover:text-loam transition-colors">Reporting</Link>
            <Link href="/cookies" className="hover:text-loam transition-colors">Cookies</Link>
          </nav>
          <p className="text-center text-xs text-stone-300 mt-3">&copy; {new Date().getFullYear()} Litter Pick</p>
        </div>
      </footer>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
