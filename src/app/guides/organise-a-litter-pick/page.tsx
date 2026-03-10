import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Organise a litter pick — Litter Pick',
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

          <h1 className="text-3xl font-bold text-loam">Organise a litter pick</h1>
          <p className="text-weathered mt-3 leading-relaxed">
            Cleaning up your area does not have to be complicated. With Litter Pick, you can join an existing
            event or organise your own local litter pick in just a few steps. Whether it is a park, path,
            roadside verge or neighbourhood hotspot, a small group of people can make a big difference in a
            short amount of time.
          </p>

          {/* Get started CTA cards */}
          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-loam">Get started with Litter Pick</h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <Link href="/picks" className="block bg-brand-50 rounded-xl p-4 hover:bg-brand-100 transition-colors">
                <h3 className="text-sm font-semibold text-brand-600 mb-1">Join a litter pick</h3>
                <p className="text-xs text-weathered leading-relaxed">
                  Want to help without organising one yourself? Browse local events and join one near you.
                </p>
              </Link>
              <Link href="/map" className="block bg-brand-50 rounded-xl p-4 hover:bg-brand-100 transition-colors">
                <h3 className="text-sm font-semibold text-brand-600 mb-1">Organise a litter pick</h3>
                <p className="text-xs text-weathered leading-relaxed">
                  Want to set one up yourself? Find a hotspot near you and select Organise a pick.
                </p>
              </Link>
              <Link href="/report" className="block bg-stone-50 rounded-xl p-4 hover:bg-stone-100 transition-colors">
                <h3 className="text-sm font-semibold text-loam mb-1">Can&apos;t find the hotspot?</h3>
                <p className="text-xs text-weathered leading-relaxed">
                  Report it first. Once reported, it should appear so you can organise a pick there.
                </p>
              </Link>
            </div>
          </div>

          <div className="mt-12 space-y-10 text-weathered leading-relaxed">
            <h2 className="text-2xl font-bold text-loam">How to organise a litter pick</h2>

            {/* Step 1 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">1</span>
                Choose the right time
              </h3>
              <p>
                Pick a date and time that works for you as the organiser. If you want the best chance
                of a good turnout, plan your litter pick for:
              </p>
              <ul className="mt-3 space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>a weekend</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>daylight hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>late morning or early afternoon</span>
                </li>
              </ul>
              <p className="mt-3">Keeping it easy for others to attend usually means more people joining.</p>
            </section>

            {/* Step 2 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">2</span>
                Create your event
              </h3>
              <p>
                Once you have chosen your hotspot and time, create the event on Litter Pick.
                Make sure your event includes:
              </p>
              <ul className="mt-3 space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>where to meet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>when it starts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>how long it will last</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>what people should bring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>whether equipment will be provided</span>
                </li>
              </ul>
              <p className="mt-3">Once your pick is live, other people can discover it and join.</p>
            </section>

            {/* Step 3 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">3</span>
                Get the equipment you need
              </h3>
              <p>
                You do not need much, but the right kit makes litter picking safer and easier.
              </p>
              <h4 className="text-sm font-semibold text-loam mt-4 mb-2">Essentials</h4>
              <ul className="space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>litter picker or grabber</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>sturdy gloves</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>rubbish bags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>sensible footwear</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>weather-appropriate clothing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>hand sanitiser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>drinking water</span>
                </li>
              </ul>
              <p className="mt-4">You can get equipment by:</p>
              <ul className="mt-2 space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>buying it from a local hardware shop, supermarket or garden centre</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>ordering it online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>asking your local council if they lend equipment to volunteers</span>
                </li>
              </ul>
              <p className="mt-3">Many councils already have schemes for local litter picks and may be able to help.</p>
            </section>

            {/* Step 4 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">4</span>
                Contact your local council
              </h3>
              <p>
                It is worth letting your local council know before your litter pick takes place.
                They can often help by:
              </p>
              <ul className="mt-3 space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>lending equipment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>supplying official council-branded rubbish bags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>advising where to leave filled bags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>arranging a suitable collection point</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>collecting the rubbish afterwards</span>
                </li>
              </ul>
              <p className="mt-3">
                A quick message in advance can make the day much smoother and help make sure the waste
                is collected properly.
              </p>
            </section>

            {/* Step 5 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">5</span>
                Pick a safe location
              </h3>
              <p>Choose an area that clearly needs attention and is safe to access.</p>
              <h4 className="text-sm font-semibold text-loam mt-4 mb-2">Good options include</h4>
              <ul className="space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>local streets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>parks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>footpaths</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>green spaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>beaches or riversides with safe access</span>
                </li>
              </ul>
              <h4 className="text-sm font-semibold text-red-600 mt-4 mb-2">Avoid risky locations such as</h4>
              <ul className="space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>busy roads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>steep banks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>deep water edges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>unstable ground</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>derelict areas</span>
                </li>
              </ul>
            </section>

            {/* Step 6 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">6</span>
                Keep safety in mind
              </h3>
              <p>Litter picking is simple, but it still needs common sense.</p>
              <h4 className="text-sm font-semibold text-loam mt-4 mb-2">Good practice</h4>
              <ul className="space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>wear gloves throughout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>stay within your physical limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>avoid overfilling bags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>take breaks if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>stay aware of your surroundings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>work in daylight where possible</span>
                </li>
              </ul>
              <h4 className="text-sm font-semibold text-red-600 mt-4 mb-2">Do not pick up</h4>
              <ul className="space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>needles or syringes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>chemical containers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>asbestos or suspicious building waste</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>oil drums</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>hot disposable BBQs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>large dumped items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  <span>broken glass unless you can store it safely</span>
                </li>
              </ul>
              <p className="mt-3">
                If you find hazardous waste or fly-tipping, report it to your local council rather than
                trying to move it yourself.
              </p>
            </section>

            {/* Step 7 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">7</span>
                Keep it family-friendly
              </h3>
              <p>
                Children can join litter picks, but they should always be supervised by a responsible adult.
                Make sure they know:
              </p>
              <ul className="mt-3 space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>not to touch anything sharp or unknown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>to ask an adult if they are unsure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>to stay within the agreed area</span>
                </li>
              </ul>
            </section>

            {/* Step 8 */}
            <section>
              <h3 className="text-lg font-semibold text-loam mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold">8</span>
                Finish the pick properly
              </h3>
              <p>At the end of the event:</p>
              <ul className="mt-3 space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>tie off the bags securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>leave them at the agreed collection point</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>wash or sanitise hands</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>thank everyone who joined</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>encourage people to come back for the next one</span>
                </li>
              </ul>
              <p className="mt-3">One good pick often leads to another.</p>
            </section>

            {/* Why it matters */}
            <section className="bg-stone-50 rounded-2xl p-6 mt-12">
              <h2 className="text-xl font-semibold text-loam mb-3">Why it matters</h2>
              <p>Litter does more than make a place look messy. It can:</p>
              <ul className="mt-3 space-y-1.5 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>harm wildlife and pets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>pollute rivers and oceans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>make neighbourhoods feel neglected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">&#8226;</span>
                  <span>reduce local pride</span>
                </li>
              </ul>
              <p className="mt-3">
                A litter pick is a simple, practical way to improve the place around you and get others involved too.
              </p>
            </section>

            {/* FAQs */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-loam mb-6">Frequently asked questions</h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-loam">Do I need to organise a pick on my own?</h3>
                  <p className="text-sm mt-1">
                    No. You can either organise your own event or join one that is already live on
                    the <Link href="/picks" className="text-brand-500 hover:text-brand-600 underline">Picks page</Link>.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-loam">What if my area is not listed as a hotspot?</h3>
                  <p className="text-sm mt-1">
                    Report it first on the <Link href="/report" className="text-brand-500 hover:text-brand-600 underline">Report page</Link>.
                    Once it has been added, you should be able to organise a pick there.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-loam">Where can I get litter picking equipment?</h3>
                  <p className="text-sm mt-1">
                    You can buy it locally, order it online, or contact your local council to see if they lend
                    equipment to volunteers.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-loam">Should I tell the council before the event?</h3>
                  <p className="text-sm mt-1">
                    Yes, ideally. Many councils can provide bags, lend equipment and arrange waste collection afterwards.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-loam">What time works best for a litter pick?</h3>
                  <p className="text-sm mt-1">
                    Weekends during daylight hours usually give you the best chance of getting people to join.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-loam">Can children take part?</h3>
                  <p className="text-sm mt-1">
                    Yes, but they should always be supervised by a responsible adult.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-loam">What should I do with the rubbish afterwards?</h3>
                  <p className="text-sm mt-1">
                    Speak to your local council before the event so they can tell you where to leave the bags
                    and whether they can collect them.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Final CTA */}
          <div className="mt-12 bg-brand-500 rounded-2xl p-6 text-center text-white">
            <h2 className="text-xl font-bold mb-2">Ready to make a difference?</h2>
            <p className="text-sm text-white/80 mb-5">Spot it. Pick it. Clear it.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/picks"
                className="px-5 py-2.5 bg-white text-brand-600 font-semibold text-sm rounded-xl hover:bg-white/90 transition-colors"
              >
                Join a pick
              </Link>
              <Link
                href="/map"
                className="px-5 py-2.5 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-colors"
              >
                Organise a pick
              </Link>
              <Link
                href="/report"
                className="px-5 py-2.5 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-colors"
              >
                Report a hotspot
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-stone-100">
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
