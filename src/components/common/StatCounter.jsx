import { cn } from '@/lib/utils';

/**
 * Large number display in the style of the Startup India counters
 * ("DPIIT Recognised Startups", "BHASKAR Users").
 */
export function StatCounter({ icon: Icon, value, label, accent = 'saffron', className }) {
  const accents = {
    saffron: 'bg-saffron-50 text-saffron-600',
    navy: 'bg-navy-50 text-navy-900',
    green: 'bg-gov-greenLight text-gov-green',
    amber: 'bg-gov-amberLight text-gov-amber',
  };

  return (
    <div className={cn('rounded-gov border border-gov-border bg-white p-5 shadow-card', className)}>
      {Icon ? (
        <span className={cn('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-gov', accents[accent])}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
      ) : null}
      <div className="text-3xl font-extrabold leading-none tracking-tight text-navy-900">{value}</div>
      <div className="mt-2 text-sm font-medium text-gov-muted">{label}</div>
    </div>
  );
}
