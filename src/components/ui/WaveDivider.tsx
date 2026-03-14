import { cn } from '@/lib/utils';

type WaveStyle = 'gentle' | 'organic' | 'subtle';

interface WaveDividerProps {
  flip?: boolean;
  color?: string;
  className?: string;
  style?: WaveStyle;
}

const wavePaths: Record<WaveStyle, string> = {
  gentle: 'M0,50 C360,100 720,0 1080,50 C1260,75 1380,65 1440,50 L1440,100 L0,100 Z',
  organic: 'M0,60 C180,40 360,80 540,60 C720,40 900,70 1080,50 C1260,30 1380,55 1440,45 L1440,100 L0,100 Z',
  subtle: 'M0,70 C480,50 960,90 1440,60 L1440,100 L0,100 Z',
};

export default function WaveDivider({ 
  flip = false, 
  color = '#FAF8F5',
  className,
  style = 'gentle',
}: WaveDividerProps) {
  return (
    <svg 
      className={cn(
        'w-full h-12 md:h-16 lg:h-20 block',
        flip && 'rotate-180',
        className
      )} 
      viewBox="0 0 1440 100" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path 
        fill={color} 
        d={wavePaths[style]}
      />
    </svg>
  );
}

export function BlobDecoration({ 
  className,
  color = 'brand',
}: { 
  className?: string;
  color?: 'brand' | 'accent' | 'sky' | 'sunlight';
}) {
  const colorMap = {
    brand: 'bg-brand-200',
    accent: 'bg-accent-200',
    sky: 'bg-sky-200',
    sunlight: 'bg-sunlight-200',
  };
  
  return (
    <div 
      className={cn(
        'blob-decoration',
        colorMap[color],
        className
      )}
      aria-hidden="true"
    />
  );
}
