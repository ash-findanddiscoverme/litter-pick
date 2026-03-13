import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Why is there so much litter on our roads — Litter Pick',
  description: 'Where roadside litter comes from, why it builds up, and what communities across the UK are doing about it.',
};

export default function RoadsGuide() {
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

          <h1 className="text-3xl font-bold text-loam">Why is there so much litter on our roads</h1>
          <p className="text-weathered mt-3 leading-relaxed">
            Drive any A-road in the UK and you will see it — drink cans in the verge,
            plastic bags caught in hedgerows, fast-food packaging scattered along laybys.
            It is one of the most visible forms of litter, and one of the hardest to tackle.
          </p>

          <div className="mt-10 space-y-8 text-weathered leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Where does it come from</h2>
              <p>
                Most roadside litter is thrown from vehicles. Drink containers, food packaging,
                and cigarette ends make up the majority. Some is accidental — unsecured loads
                on vans, items blown from open windows. But studies consistently find that
                deliberate littering from cars is the main source.
              </p>
              <p className="mt-3">
                Laybys and junctions are the worst affected. Drivers stop, eat, and leave
                packaging behind. Over time the litter attracts more litter — a well-documented
                effect where mess signals that an area is not cared for.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">Why does it build up</h2>
              <p>
                Council road-cleaning budgets have been cut significantly over the past decade.
                Many rural A-roads and B-roads are cleaned infrequently, sometimes only once
                or twice a year. Meanwhile, traffic volumes and takeaway food consumption have
                both increased.
              </p>
              <p className="mt-3">
                Safety is also a factor. Litter on fast roads is dangerous to collect. Councils
                need traffic management (cones, signs, lane closures) to send crews out safely,
                which makes every clean-up expensive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">The environmental cost</h2>
              <p>
                Roadside litter is not just unsightly. Plastic breaks down into microplastics
                that wash into ditches, streams, and eventually rivers. Cans and bottles can
                trap small animals. Glass fragments are a fire risk in dry grass during summer.
              </p>
              <p className="mt-3">
                Agricultural land next to littered roads is affected too. Farmers report litter
                getting caught in machinery and animals ingesting packaging that blows into
                fields.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">What communities are doing</h2>
              <p>
                Volunteer litter picks have grown rapidly. Groups adopt stretches of road and
                clean them regularly — often monthly. Across the UK, parish councils and
                community groups coordinate picks along popular routes and publish the results
                to keep momentum going.
              </p>
              <p className="mt-3">
                Reporting litter hotspots through tools like Litter Pick helps councils
                prioritise their limited cleaning budgets. When data shows which spots are
                repeatedly bad, it makes the case for bins, barriers, or more frequent
                collections.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-loam mb-3">What you can do</h2>
              <p>
                Report what you see. Every report on the map helps build a picture of where
                the problem is worst. If you are comfortable picking safely — on footpaths,
                verges away from fast traffic, laybys when they are quiet — even a single bag
                makes a visible difference.
              </p>
              <p className="mt-3">
                Never pick on fast roads without proper safety measures. Stick to areas where
                you can see oncoming traffic and keep well clear of the carriageway. Your safety
                comes first.
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
