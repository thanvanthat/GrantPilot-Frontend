import { ArrowRight } from 'lucide-react';
import { complianceNextActions } from '@/utils/complianceEngine';

/** Actionable next steps tailored to the readiness state. */
export function NextActions({ result }) {
  const actions = complianceNextActions(result);
  return (
    <ol className="space-y-2">
      {actions.map((a, i) => (
        <li key={i} className="flex items-start gap-3 rounded-gov border border-gov-border bg-white p-3 text-sm text-gov-ink">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron-50 text-xs font-bold text-saffron-600">{i + 1}</span>
          <span className="flex-1">{a}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
        </li>
      ))}
    </ol>
  );
}
