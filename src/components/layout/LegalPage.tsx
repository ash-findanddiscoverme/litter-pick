import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold text-loam">{title}</h1>
          <p className="mt-2 text-sm text-stone-300">Last updated: {lastUpdated}</p>
          <div className="mt-8 space-y-5 text-weathered leading-relaxed">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
