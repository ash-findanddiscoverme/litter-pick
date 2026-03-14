import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Guides — Litter Pick',
  description: 'Practical guides for litter picking, organising community picks, and keeping your area clean.',
};

const guides = [
  {
    slug: 'organise-a-litter-pick',
    title: 'How to organise a litter pick',
    description: 'Everything you need to plan a successful community litter pick — from choosing a site to rallying volunteers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    colour: 'bg-brand-50 text-brand-500',
  },
  {
    slug: 'litter-on-our-roads',
    title: 'Why is there so much litter on our roads',
    description: 'A look at where roadside litter comes from, why it persists, and what communities can do about it.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    colour: 'bg-amber-50 text-amber-600',
  },
  {
    slug: 'your-first-litter-pick',
    title: 'Your first litter pick — what to expect',
    description: 'New to litter picking? Here is what to bring, how long it takes, and why it is more rewarding than you think.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    colour: 'bg-emerald-50 text-emerald-600',
  },
];

export default function GuidesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-moss-50 border-b border-stone-100">
          <div className="max-w-2xl mx-auto px-4 py-16 md:py-20 text-center relative z-10">
            <span className="inline-block px-4 py-1.5 bg-brand-100 text-brand-600 text-sm font-medium rounded-full mb-4">
              Learn
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-loam">
              Guides
            </h1>
            <p className="text-weathered mt-4 max-w-md mx-auto leading-relaxed text-lg">
              Practical advice for litter picking, organising community events, and understanding the problem.
            </p>
          </div>
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-moss-200/20 rounded-full blur-3xl" />
        </div>

        {/* Guide cards */}
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
          <div className="grid sm:grid-cols-2 gap-5">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group block rounded-3xl border border-stone-100 bg-white p-6 hover:border-brand-200 hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${guide.colour} mb-5`}>
                  {guide.icon}
                </div>
                <h2 className="font-display text-lg font-semibold text-loam group-hover:text-brand-600 transition-colors">
                  {guide.title}
                </h2>
                <p className="text-sm text-weathered mt-2 leading-relaxed">
                  {guide.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 mt-4">
                  Read guide
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
