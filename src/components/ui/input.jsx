import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-gov border border-gov-border bg-white px-3 text-sm text-gov-ink',
        'placeholder:text-slate-400 focus:border-saffron-500 focus:outline-none focus:ring-1 focus:ring-saffron-500',
        'disabled:cursor-not-allowed disabled:bg-slate-50',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-gov border border-gov-border bg-white px-3 py-2 text-sm leading-relaxed text-gov-ink',
        'placeholder:text-slate-400 focus:border-saffron-500 focus:outline-none focus:ring-1 focus:ring-saffron-500',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-gov border border-gov-border bg-white px-3 text-sm text-gov-ink',
        'focus:border-saffron-500 focus:outline-none focus:ring-1 focus:ring-saffron-500',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }) {
  return <label className={cn('mb-1.5 block text-sm font-semibold text-navy-900', className)} {...props} />;
}
