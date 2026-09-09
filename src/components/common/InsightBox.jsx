import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Restrained AI-assisted insight surface. Indigo is reserved for AI content
 * and is never the dominant colour on a page.
 */
export function InsightBox({ title = 'GrantPilot AI Insight', children, className }) {
  return (
    <div className={cn('ai-insight p-4', className)}>
      <p className="flex items-center gap-2 text-sm font-bold text-ai">
        <Sparkles className="h-4 w-4" /> {title}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-navy-900/90">{children}</div>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-ai/70">AI-assisted · based on available information</p>
    </div>
  );
}
