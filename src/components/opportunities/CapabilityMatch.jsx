import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

function Row({ cap, state }) {
  const cfg = {
    matched: { icon: CheckCircle2, cls: 'text-gov-green', label: 'Matched' },
    partial: { icon: AlertTriangle, cls: 'text-gov-amber', label: 'Partial' },
    missing: { icon: XCircle, cls: 'text-gov-red', label: 'Missing' },
  }[state];
  const Icon = cfg.icon;
  return (
    <li className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="flex items-center gap-2 text-gov-ink"><Icon className={cn('h-4 w-4', cfg.cls)} />{cap}</span>
      <span className={cn('text-xs font-semibold', cfg.cls)}>{cfg.label}</span>
    </li>
  );
}

/**
 * Required-vs-available capability comparison.
 * @param {{ capabilityMatch: import('@/types').QualificationResult['capabilityMatch'] }} props
 */
export function CapabilityMatch({ capabilityMatch }) {
  const { required, matched, partial, missing } = capabilityMatch;
  const stateOf = (cap) => (matched.includes(cap) ? 'matched' : partial.includes(cap) ? 'partial' : 'missing');

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-gov border border-gov-border bg-gov-bg p-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-muted">Required by opportunity</h4>
          <ul className="space-y-1 text-sm text-gov-ink">
            {required.map((c) => <li key={c} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-navy-900" />{c}</li>)}
          </ul>
        </div>
        <div className="rounded-gov border border-gov-border bg-white p-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-muted">Available in startup</h4>
          <ul>
            {required.map((c) => <Row key={c} cap={c} state={stateOf(c)} />)}
          </ul>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-navy-900">
        {matched.length} of {required.length} required capabilities matched
        {partial.length ? `, ${partial.length} partial` : ''}.
      </p>
    </div>
  );
}
