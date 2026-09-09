import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Inline loading indicator used by AI/mock async actions. */
export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8 text-sm font-medium text-gov-muted', className)}>
      <Loader2 className="h-4 w-4 animate-spin text-saffron-500" />
      {label}
    </div>
  );
}
