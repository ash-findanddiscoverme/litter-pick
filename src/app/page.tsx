import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-stone-50 to-stone-50">
          {/* Hero image with overlaid heading */}
          <div className="relative w-full">
            <img
              src="/hero.webp"
              srcSet="/hero-480w.webp 480w, /hero-768w.webp 768w, /hero-1024w.webp 1024w, /hero.webp 1920w"
              sizes="100vw"
              alt="British countryside at golden hour"
              width={1920}
              height={1279}
              fetchPriority="high"
              decoding="async"
              className="w-full h-64 sm:h-80 md:h-[28rem] lg:h-[32rem] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end max-w-6xl mx-auto px-4 pb-8 md:pb-12">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-1.5 text-sm font-medium mb-4 w-fit">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Across the UK
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg">
                Care for your{' '}
                <span className="text-brand-300">corner.</span>
              </h1>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
            <div className="max-w-2xl">
              <p className="text-lg text-weathered leading-relaxed max-w-lg">
                Litter Pick helps you report rubbish, find local hotspots, and join
                picks near you. A simpler way to look after where you live.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <a href="/report" className="block">
                  <Button size="lg" fullWidth>Report litter</Button>
                </a>
                <a href="/picks" className="block">
                  <Button size="lg" variant="outline" fullWidth>I want to help</Button>
                </a>
              </div>
            </div>
          </div>
          {/* Decorative blobs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -left-24 w-80 h-80 bg-accent-100/20 rounded-full blur-3xl" />
        </section>

        {/* How it works */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-loam text-center">
              How Litter Pick works
            </h2>
            <p className="text-weathered text-center mt-3 max-w-xl mx-auto">
              Three simple steps to help local places feel cared for again.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  step: '1',
                  title: 'Spot it',
                  image: '/spot-it.webp',
                  imageAlt: 'Litter on a roadside verge',
                  desc: 'See litter? Snap a quick photo and drop a pin. No account needed \u2014 it only takes a few seconds.',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  ),
                },
                {
                  step: '2',
                  title: 'Pick it',
                  image: '/join-up.webp',
                  imageAlt: 'Volunteers picking litter together',
                  desc: 'When enough reports build up, a local pick can take shape. Sign up to volunteer and we\u2019ll help connect you with nearby picks.',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  ),
                },
                {
                  step: '3',
                  title: 'Clear it',
                  image: '/clear-it.webp',
                  imageAlt: 'Clean countryside lane after a litter pick',
                  desc: 'Grab a bag, head out, and help make the area feel cared for again. Add an after photo and the map updates to show the difference.',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="relative bg-stone-50 rounded-2xl p-6 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-loam">{item.title}</h3>
                  <p className="text-sm text-weathered mt-2 leading-relaxed flex-1">{item.desc}</p>
                  {item.image && (
                    <img
                      src={item.image}
                      srcSet={`${item.image.replace('.webp', '-332w.webp')} 332w, ${item.image} 800w`}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      alt={item.imageAlt}
                      width={800}
                      height={800}
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-square object-cover rounded-xl mt-4"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map preview */}
        <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-loam">
              See where help is needed
            </h2>
            <p className="text-weathered mt-3 max-w-md mx-auto">
              The heatmap shows litter density in your area. Brighter spots mean more reports.
            </p>
            <div className="mt-8">
              <a href="/map">
                <Button size="lg">Open the map</Button>
              </a>
            </div>
          </div>
        </section>

        {/* Donate CTA */}
        <section className="py-16 bg-stone-50">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-loam">
              Help keep this going
            </h2>
            <p className="text-weathered mt-3 max-w-md mx-auto">
              Litter Pick is free to use and volunteer-run. A small donation
              helps fund supplies, mapping tools, and community picks.
            </p>
            <div className="mt-8">
              <a href="/donate">
                <Button size="lg">Make a donation</Button>
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-brand-500">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Every report builds the picture.
            </h2>
            <p className="text-brand-200 mt-3 max-w-md mx-auto">
              You don&apos;t have to do it alone. Spot something, log it, and let your neighbours know.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a href="/report" className="inline-block">
                <button className="px-6 py-3 text-base font-semibold rounded-xl bg-white text-brand-600 hover:bg-brand-50 transition-all shadow-sm w-full sm:w-auto min-w-[200px]">
                  Report litter
                </button>
              </a>
              <a href="/volunteer" className="inline-block">
                <button className="px-6 py-3 text-base font-semibold rounded-xl border-2 border-white text-white hover:bg-brand-600 transition-all w-full sm:w-auto min-w-[200px]">
                  Become a volunteer
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
