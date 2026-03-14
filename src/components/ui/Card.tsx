import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'organic' | 'feature' | 'ghost';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  variant?: CardVariant;
  hover?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-stone-100 shadow-sm',
  elevated: 'bg-white shadow-soft',
  organic: 'bg-stone-50/80 border border-stone-200/50 backdrop-blur-sm',
  feature: 'bg-gradient-to-br from-brand-50 to-white border border-brand-100/50',
  ghost: 'bg-transparent',
};

export default function Card({ 
  children, 
  className, 
  padding = true, 
  variant = 'default',
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl',
        variantStyles[variant],
        padding && 'p-6',
        hover && 'card-lift cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
