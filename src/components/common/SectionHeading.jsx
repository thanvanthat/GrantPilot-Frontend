import { cn } from '@/lib/utils';

/**
 * Startup India style section header: bold title with a short saffron
 * underline accent, optional description and right-aligned action slot.
 */
export function SectionHeading({ title, description, action, className }) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <h2 className="heading-underline text-xl font-bold tracking-tight text-navy-900">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-sm text-gov-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
