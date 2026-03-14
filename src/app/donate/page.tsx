import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DonationForm from '@/components/donate/DonationForm';

export const metadata = {
  title: 'Donate — Litter Pick',
  description:
    'Support Litter Pick with a one-off or monthly donation. Your contribution helps fund picks, volunteer supplies, and litter mapping across the UK.',
};

const impactItems = [
  { 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ), 
    label: 'Bags, gloves and litter pickers',
    color: 'bg-brand-100 text-brand-600',
  },
  { 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ), 
    label: 'Mapping and hotspot monitoring',
    color: 'bg-sky-100 text-sky-600',
  },
  { 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ), 
    label: 'Community outreach and events',
    color: 'bg-accent-100 text-accent-500',
  },
  { 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ), 
    label: 'Expanding to new areas',
    color: 'bg-moss-100 text-moss-500',
  },
];

export default function DonatePage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-accent-50 via-stone-50 to-sunlight-50">
          <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
            <span className="inline-block px-4 py-1.5 bg-accent-100 text-accent-600 text-sm font-medium rounded-full mb-4">
              Support us
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-loam tracking-tight">
              Support the{' '}
              <span className="text-brand-500">mission.</span>
            </h1>
            <p className="text-lg text-weathered mt-5 max-w-xl mx-auto leading-relaxed">
              Litter Pick is free to use and run by volunteers. Your donation
              helps fund supplies, mapping tools, and community litter picks across the UK.
            </p>
          </div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-48 h-48 bg-sunlight-200/30 rounded-full blur-3xl" />
        </section>

        {/* Donation form */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <DonationForm />
          </div>
        </section>

        {/* How donations help */}
        <section className="py-16 md:py-20 bg-stone-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-sm font-medium rounded-full mb-4">
                Your impact
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-loam">
                Where your money goes
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
              {impactItems.map((item) => (
                <div
                  key={item.label}
                  className="text-center p-6 rounded-3xl bg-white shadow-sm border border-stone-100"
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <p className="text-sm text-loam font-medium leading-relaxed">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
