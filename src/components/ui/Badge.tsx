import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-600 border-stone-200',
  success: 'bg-brand-50 text-brand-600 border-brand-100',
  warning: 'bg-sunlight-100 text-sunlight-500 border-sunlight-200',
  info: 'bg-sky-100 text-sky-500 border-sky-200',
  accent: 'bg-accent-50 text-accent-500 border-accent-100',
};

export default function Badge({ 
  children, 
  className, 
  variant = 'default',
  icon,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
        'border transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
