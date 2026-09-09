import { cn } from '@/lib/utils';

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        'border-slate-300 bg-slate-100 text-slate-700',
        className,
      )}
      {...props}
    />
  );
}
