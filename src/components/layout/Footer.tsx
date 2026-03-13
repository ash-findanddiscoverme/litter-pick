'use client';

import { useState } from 'react';
import Link from 'next/link';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

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
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
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
