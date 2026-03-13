import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Litter Map - Heat map of reported litter across the UK',
  description:
    'Explore a live heat map of litter reports across the UK. See where rubbish is building up, find hotspots near you, and help coordinate community picks.',
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
