import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Consistent empty state for lists with no data. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-gov border border-dashed border-gov-border bg-white px-6 py-12 text-center', className)}>
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gov-bg text-slate-400">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-bold text-navy-900">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-gov-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
