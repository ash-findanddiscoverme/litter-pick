import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'How to organise a litter pick — Litter Pick',
  description: 'A step-by-step guide to planning and running a successful community litter pick in your area.',
};

export default function OrganiseGuide() {
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

          <h1 className="text-3xl font-bold text-loam">How to organise a litter pick</h1>
          <p className="text-weathered mt-3 leading-relaxed">
            You do not need permission, a budget, or a committee. A litter pick can be as
            simple as a time, a place, and a few willing neighbours. Here is how to get one
            off the ground.
          </p>

          <div className="mt-10 space-y-8 text-weathered leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Pick a location</h2>
              <p>
                Start with somewhere you know well. A street you walk every day, a park the
                kids use, a layby that collects fast-food wrappers. Familiarity helps because
                you already know where the worst spots are and what kind of litter to expect.
              </p>
              <p className="mt-3">
                Check the Litter Pick map to see if reports have already flagged the area as
                a hotspot — that makes it easier to rally support because others have already
                noticed the problem.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Choose a date and time</h2>
              <p>
                Weekend mornings work well. People are free, the light is good, and you can
                finish before lunch. Aim for a two-hour window — most groups fill several bags
                well within that time. Avoid school holidays if you want a reliable turnout.
              </p>
              <p className="mt-3">
                Post the pick on Litter Pick so people nearby can see it on the map and join
                with one tap.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Equipment</h2>
              <p>
                The basics: bin bags, gloves, and a litter picker if you have one. Most councils
                will lend equipment for free — search for your local council&apos;s litter pick
                lending scheme. High-vis vests are useful if you are near roads.
              </p>
              <p className="mt-3">
                Ask volunteers to bring their own gloves and a reusable water bottle. Keeping
                things simple lowers the barrier to joining.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Spread the word</h2>
              <p>
                Share the pick link in local WhatsApp groups, on Nextdoor, or on a notice board
                at the village hall. A short message works best: where, when, what to bring.
                People are more likely to join if someone they know is going.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">On the day</h2>
              <p>
                Arrive ten minutes early. Greet people as they turn up — first-timers especially
                appreciate a friendly face. Assign rough areas so you are not all picking the same
                patch. Keep an eye on anyone near roads.
              </p>
              <p className="mt-3">
                Take a before photo. It is satisfying to compare with the after shot, and it helps
                build the case for more regular picks in the area.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">After the pick</h2>
              <p>
                Pile the bags somewhere visible for council collection — most councils will collect
                bags left at an agreed spot. Log the pick on Litter Pick with an after photo so
                the hotspot status updates. Thank everyone and suggest a date for the next one
                while the energy is still high.
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
