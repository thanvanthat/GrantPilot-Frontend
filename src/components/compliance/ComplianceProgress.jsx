import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const COMPLIANCE_STEPS = [
  'Reading requirements',
  'Checking qualification findings',
  'Checking proposal coverage',
  'Checking documents',
  'Preparing readiness report',
];

/** Staged loading sequence for the (mock) compliance check. */
export function ComplianceProgress({ active = 0 }) {
  return (
    <div className="mx-auto max-w-md py-4">
      <p className="mb-4 flex items-center gap-2 text-sm font-bold text-navy-900">
        <Loader2 className="h-4 w-4 animate-spin text-saffron-500" /> Running compliance check…
      </p>
      <ul className="space-y-2.5">
        {COMPLIANCE_STEPS.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={step} className="flex items-center gap-2.5 text-sm">
              {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-green" />
                : current ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-saffron-500" />
                : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
              <span className={cn(done ? 'text-gov-ink' : current ? 'font-semibold text-navy-900' : 'text-slate-400')}>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
