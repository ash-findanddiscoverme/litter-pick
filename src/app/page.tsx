import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import WaveDivider, { BlobDecoration } from '@/components/ui/WaveDivider';

const stats = [
  { value: '2,400+', label: 'Reports logged' },
  { value: '180+', label: 'Volunteers' },
  { value: '45', label: 'Communities' },
];

const steps = [
  {
    step: '1',
    title: 'Spot it',
    image: '/spot-it.webp',
    imageAlt: 'Litter on a roadside verge',
    desc: 'See litter? Snap a quick photo and drop a pin. No account needed — it only takes a few seconds.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-[72px]">
        {/* Hero */}
        <section className="relative overflow-hidden">
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
              className="w-full h-72 sm:h-96 md:h-[32rem] lg:h-[36rem] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
            <div className="absolute inset-0 flex flex-col justify-end max-w-6xl mx-auto px-4 pb-10 md:pb-16">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white rounded-full px-4 py-2 text-sm font-medium mb-5 w-fit border border-white/20">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-gentle-pulse" />
                Active across the UK
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                Care for your{' '}
                <span className="text-brand-300">corner.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mt-4 max-w-xl leading-relaxed">
                Report rubbish, find local hotspots, and join picks near you. 
                A simpler way to look after where you live.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <a href="/report">
                  <Button size="lg" className="shadow-soft-lg">Report litter</Button>
                </a>
                <a href="/picks">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 hover:border-white">
                    I want to help
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          {/* Decorative gradient transition */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 to-transparent" />
        </section>

        {/* Social proof stats */}
        <section className="relative bg-stone-50 py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="font-display text-2xl md:text-4xl font-bold text-brand-600">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-weathered mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <BlobDecoration color="brand" className="w-64 h-64 -top-32 -right-16" />
          <BlobDecoration color="sunlight" className="w-48 h-48 -bottom-24 left-8" />
        </section>

        <WaveDivider color="#ffffff" style="gentle" />

        {/* How it works */}
        <section className="relative py-16 md:py-24 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-sm font-medium rounded-full mb-4">
                How it works
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-loam">
                Three simple steps
              </h2>
              <p className="text-weathered mt-4 text-lg">
                Help local places feel cared for again. No expertise needed.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((item, index) => (
                <div 
                  key={item.step} 
                  className="group relative bg-stone-50 rounded-3xl p-6 lg:p-8 flex flex-col transition-all duration-300 hover:shadow-soft hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Step number badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-brand-500 text-white rounded-2xl flex items-center justify-center font-display font-bold text-lg shadow-soft">
                    {item.step}
                  </div>
                  
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold text-loam mb-2">
                    {item.title}
                  </h3>
                  <p className="text-weathered leading-relaxed flex-1">
                    {item.desc}
                  </p>
                  
                  {item.image && (
                    <div className="mt-6 rounded-2xl overflow-hidden">
                      <img
                        src={item.image}
                        srcSet={`${item.image.replace('.webp', '-332w.webp')} 332w, ${item.image} 800w`}
                        sizes="(min-width: 768px) 33vw, 100vw"
                        alt={item.imageAlt}
                        width={800}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider color="#FAF8F5" style="organic" />

        {/* Map preview */}
        <section className="relative py-16 md:py-24 bg-stone-50 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-600 text-sm font-medium rounded-full mb-4">
                  Explore hotspots
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-loam">
                  See where help is needed
                </h2>
                <p className="text-weathered mt-4 text-lg leading-relaxed">
                  Our heatmap shows litter density across your area. 
                  Brighter spots mean more reports — and more opportunity to make a difference.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Find hotspots near you',
                    'Track cleanup progress over time',
                    'See where volunteers are active',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-loam">
                      <span className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a href="/map">
                    <Button size="lg">Open the map</Button>
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-soft-lg p-4 border border-stone-100">
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-100 to-moss-100 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-brand-500 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                        </svg>
                      </div>
                      <p className="text-brand-700 font-medium">Interactive heatmap</p>
                      <p className="text-brand-600/70 text-sm mt-1">Click to explore</p>
                    </div>
                  </div>
                </div>
                <BlobDecoration color="brand" className="w-48 h-48 -bottom-12 -right-12" />
              </div>
            </div>
          </div>
        </section>

        <WaveDivider color="#ffffff" style="subtle" />

        {/* Donate CTA */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative bg-gradient-to-br from-accent-50 via-accent-50 to-sunlight-50 rounded-4xl p-8 md:p-12 lg:p-16 overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-4 py-1.5 bg-accent-100 text-accent-600 text-sm font-medium rounded-full mb-4">
                  Support the mission
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-loam">
                  Help keep this going
                </h2>
                <p className="text-weathered mt-4 text-lg leading-relaxed">
                  Litter Pick is free to use and volunteer-run. A small donation
                  helps fund supplies, mapping tools, and community picks.
                </p>
                <div className="mt-8">
                  <a href="/donate">
                    <Button size="lg" variant="warm">Make a donation</Button>
                  </a>
                </div>
              </div>
              <BlobDecoration color="accent" className="w-64 h-64 -top-16 -right-16 opacity-30" />
              <BlobDecoration color="sunlight" className="w-48 h-48 -bottom-12 right-24 opacity-25" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-20 md:py-28 bg-brand-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600" />
          <div className="absolute top-0 left-0 right-0">
            <WaveDivider color="#4AA853" flip style="gentle" />
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
              Every report builds the picture.
            </h2>
            <p className="text-brand-100 mt-4 text-lg md:text-xl max-w-xl mx-auto">
              You don&apos;t have to do it alone. Spot something, log it, and let your neighbours know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a href="/report">
                <Button 
                  size="lg" 
                  className="bg-white text-brand-600 hover:bg-brand-50 shadow-soft-lg min-w-[200px]"
                >
                  Report litter
                </Button>
              </a>
              <a href="/volunteer">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/80 text-white hover:bg-white/10 min-w-[200px]"
                >
                  Become a volunteer
                </Button>
              </a>
            </div>
          </div>
          
          <BlobDecoration color="brand" className="w-96 h-96 -bottom-48 -left-24 opacity-30 bg-brand-400" />
          <BlobDecoration color="brand" className="w-64 h-64 -top-32 -right-16 opacity-20 bg-brand-300" />
        </section>
      </main>
      <Footer />
    </>
  );
}
