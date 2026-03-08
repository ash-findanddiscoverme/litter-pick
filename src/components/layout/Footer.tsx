import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-stone-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="text-xs text-stone-300">&copy; {new Date().getFullYear()} Litter Pick</span>
        <nav className="flex items-center gap-4 text-xs text-weathered">
          <Link href="/about" className="hover:text-loam transition-colors">About</Link>
          <Link href="/terms" className="hover:text-loam transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-loam transition-colors">Privacy</Link>
          <Link href="/community-guidelines" className="hover:text-loam transition-colors">Guidelines</Link>
          <Link href="/reporting" className="hover:text-loam transition-colors">Reporting</Link>
          <Link href="/cookies" className="hover:text-loam transition-colors">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
