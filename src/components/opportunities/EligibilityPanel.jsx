import { Info } from 'lucide-react';
import { StatusPill } from '@/components/common/StatusPill';

/**
 * Eligibility requirements, one per row, with status + explanation + evidence.
 * Decision-support only — carries the human-review disclaimer.
 * @param {{ items: import('@/types').QualificationResult['eligibilityItems'], overall: string }} props
 */
export function EligibilityPanel({ items = [], overall }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-gov-muted">Overall eligibility</span>
        <StatusPill status={overall} />
      </div>
      <ul className="divide-y divide-gov-border rounded-gov border border-gov-border bg-white">
        {items.map((item) => (
          <li key={item.requirement} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-[14rem] flex-1">
              <p className="text-sm font-medium text-navy-900">{item.requirement}</p>
              <p className="text-xs text-gov-muted">{item.explanation}</p>
              {item.evidence ? <p className="mt-0.5 text-[11px] text-slate-400">Evidence: {item.evidence}</p> : null}
            </div>
            <StatusPill status={item.status} className="shrink-0" />
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-gov-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        AI-generated qualification results should be reviewed by the responsible team before submission. This is not an official eligibility determination.
      </p>
    </div>
  );
}
