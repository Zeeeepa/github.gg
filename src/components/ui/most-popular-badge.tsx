import { cn } from "@/lib/utils";

interface MostPopularBadgeProps {
  className?: string;
  variant?: 'default' | 'uppercase';
}

export function MostPopularBadge({ className, variant = 'default' }: MostPopularBadgeProps) {
  const text = variant === 'uppercase' ? 'MOST POPULAR' : 'Most Popular';
  
  return (
    <span 
      className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold px-8 py-2 rounded-full shadow-lg border border-purple-500/20",
        variant === 'uppercase' && "tracking-wide",
        className
      )}
    >
      {text}
    </span>
  );
}
