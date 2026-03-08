import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DonationForm from '@/components/donate/DonationForm';

export const metadata = {
  title: 'Donate — Litter Pick',
  description:
    'Support Litter Pick with a one-off or monthly donation. Your contribution helps fund clean-ups, volunteer supplies, and litter mapping across Oxfordshire.',
};

export default function DonatePage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-brand-50 via-stone-50 to-stone-50">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-loam tracking-tight">
              Support the{' '}
              <span className="text-brand-500">mission.</span>
            </h1>
            <p className="text-lg text-weathered mt-4 max-w-lg mx-auto leading-relaxed">
              Litter Pick is free to use and run by volunteers. Your donation
              helps fund supplies, mapping tools, and expansion across Oxfordshire.
            </p>
          </div>
        </section>

        {/* Donation form */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <DonationForm />
          </div>
        </section>

        {/* How donations help */}
        <section className="py-12 md:py-16 bg-stone-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-bold text-loam text-center mb-8">
              Where your money goes
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: '🧤', label: 'Bags, gloves and litter pickers' },
                { icon: '🗺️', label: 'Mapping and hotspot monitoring' },
                { icon: '📢', label: 'Community outreach and events' },
                { icon: '🌱', label: 'Expanding to new areas' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-4 rounded-xl bg-white"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-sm text-weathered leading-relaxed">
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
