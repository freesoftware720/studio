import { ChefHat } from 'lucide-react'; // Changed from Loader2
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 24, className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <ChefHat className="animate-chefhat-fill text-primary" style={{ width: size, height: size }} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
