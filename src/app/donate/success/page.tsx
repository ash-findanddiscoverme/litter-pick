import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Thank you — Litter Pick',
};

export default function DonationSuccessPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="py-20 md:py-28 bg-gradient-to-br from-brand-50 via-stone-50 to-stone-50">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-loam tracking-tight">
              Thank you!
            </h1>
            <p className="text-lg text-weathered mt-4 leading-relaxed">
              Your donation makes a real difference. It goes directly towards
              keeping communities cleaner and supporting local volunteers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link href="/">
                <Button size="lg">Back to home</Button>
              </Link>
              <Link href="/map">
                <Button size="lg" variant="outline">
                  Explore the map
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
