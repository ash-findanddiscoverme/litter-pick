import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Donation cancelled — Litter Pick',
};

export default function DonationCancelPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-lg mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-loam tracking-tight">
              No worries.
            </h1>
            <p className="text-lg text-weathered mt-4 leading-relaxed">
              Your donation was cancelled and you haven&apos;t been charged.
              You can always come back if you change your mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link href="/donate">
                <Button size="lg">Try again</Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  Back to home
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
