import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Your first litter pick — what to expect — Litter Pick',
  description: 'New to litter picking? What to bring, how long it takes, and why it is more rewarding than you think.',
};

export default function FirstPickGuide() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600 mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            All guides
          </Link>

          <h1 className="text-3xl font-bold text-loam">Your first litter pick — what to expect</h1>
          <p className="text-weathered mt-3 leading-relaxed">
            Thinking about joining a litter pick but not sure what it involves? Here is
            a straightforward look at what happens, what you need, and what you will get
            out of it.
          </p>

          <div className="mt-10 space-y-8 text-weathered leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">What to bring</h2>
              <p>
                Wear clothes you do not mind getting dirty — old trainers or wellies, a
                waterproof if rain is forecast. Most organised picks provide bags and gloves,
                but it is worth bringing your own pair of sturdy gardening gloves just in case.
              </p>
              <p className="mt-3">
                A water bottle and a fully charged phone (for the before-and-after photos) are
                the only other essentials. Some people bring a litter picker — the long-handled
                grabbers — but you can manage perfectly well without one.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">How long does it take</h2>
              <p>
                Most community picks last between one and two hours. You can leave earlier if
                you need to — nobody minds. Even thirty minutes of picking makes a noticeable
                difference to an area.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">What happens when you arrive</h2>
              <p>
                The organiser will usually meet everyone at a set point — a car park, a pub,
                a village hall. They will hand out bags and gloves, explain which area you are
                covering, and point out anything to avoid (busy roads, nettles, private land).
              </p>
              <p className="mt-3">
                You then spread out and start picking. It is surprisingly social — you end up
                chatting with people you might never have met otherwise. There is no pressure
                to fill a certain number of bags. Just do what you can.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Safety tips</h2>
              <p>
                Never pick up anything you are unsure about. Needles, broken glass, and
                chemicals should be left and reported. Wear gloves at all times. Stay well
                away from fast roads unless the organiser has arranged traffic management.
              </p>
              <p className="mt-3">
                If you are picking solo, let someone know where you are going and when you
                expect to be back. Stick to public paths and keep your phone on you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Why people come back</h2>
              <p>
                The before-and-after difference is genuinely striking. A stretch of path that
                looked neglected an hour ago suddenly looks cared-for. That feeling — of having
                made a tangible improvement to a place — is what keeps people coming back.
              </p>
              <p className="mt-3">
                Most first-timers are surprised by how enjoyable it is. Fresh air, a bit of
                exercise, good company, and a visible result. It is one of the simplest ways
                to do something positive for your community.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Ready to try it</h2>
              <p>
                Browse the{' '}
                <Link href="/picks" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
                  upcoming picks
                </Link>{' '}
                to find one near you, or check the{' '}
                <Link href="/map" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
                  litter map
                </Link>{' '}
                to see hotspots in your area. You can also{' '}
                <Link href="/report" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
                  report litter
                </Link>{' '}
                you spot on your daily walks — every report helps build the picture.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-100">
            <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to guides
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
