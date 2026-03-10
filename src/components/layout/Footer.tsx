import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-stone-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-weathered">
          <Link href="/donate" className="hover:text-loam transition-colors">Donate</Link>
          <Link href="/guides" className="hover:text-loam transition-colors">Guides</Link>
          <Link href="/about" className="hover:text-loam transition-colors">About</Link>
          <Link href="/terms" className="hover:text-loam transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-loam transition-colors">Privacy</Link>
          <Link href="/community-guidelines" className="hover:text-loam transition-colors">Guidelines</Link>
          <Link href="/reporting" className="hover:text-loam transition-colors">Reporting</Link>
          <Link href="/cookies" className="hover:text-loam transition-colors">Cookies</Link>
        </nav>
        <p className="text-center text-xs text-stone-300 mt-3">&copy; {new Date().getFullYear()} Litter Pick</p>
      </div>
    </footer>
  );
}
