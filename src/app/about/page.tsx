import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'About — Litter Pick',
  description: 'What Litter Pick is, why it exists, and how it works.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold text-loam">About Litter Pick</h1>

          <div className="mt-8 space-y-5 text-weathered leading-relaxed">
            <p>
              Litter Pick is a simple tool for reporting rubbish, finding local hotspots,
              and organising picks in your area. It started in the UK and is built
              for anyone who wants to look after the places they live.
            </p>
            <p>
              Reports are pinned to a map so neighbours can see where help is needed.
              When enough reports cluster together, a hotspot forms automatically.
              Volunteers sign up, head out with bags, and log the results — the map
              updates to show the difference.
            </p>
            <p>
              No logins required to report. No forms longer than fifteen seconds.
              The aim is to make it as easy as possible to do something useful, however
              small.
            </p>

            <h2 className="text-xl font-semibold text-loam pt-4">How it works</h2>
            <p>
              <span className="font-medium text-loam">Spot it</span> — see litter,
              snap a photo, drop a pin. That&apos;s a report.
            </p>
            <p>
              <span className="font-medium text-loam">Join up</span> — hotspots form
              from clusters of reports. Sign up to volunteer and get connected with
              picks nearby.
            </p>
            <p>
              <span className="font-medium text-loam">Clear it</span> — head out,
              fill some bags, upload an after photo. The map updates to show progress.
            </p>

            <h2 className="text-xl font-semibold text-loam pt-4">Get in touch</h2>
            <p>
              Litter Pick is a community project. If you have feedback or ideas,
              drop us a line at{' '}
              <a href="mailto:hello@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
                hello@litterpick.org
              </a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
