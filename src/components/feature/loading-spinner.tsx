
import { ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 24, className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <ChefHat className="animate-chefhat-fill text-accent" style={{ width: size, height: size }} />
      {text && <p className="text-sm text-muted-foreground animate-subtle-opacity-pulse">{text}</p>}
    </div>
  );
}
