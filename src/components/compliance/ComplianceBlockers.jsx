import { SeverityBadge } from '@/components/common/StatusPill';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckCircle2 } from 'lucide-react';

const ORDER = { High: 0, Medium: 1, Low: 2 };

/** The unresolved items blocking internal-review readiness. */
export function ComplianceBlockers({ blockers = [] }) {
  if (!blockers.length) {
    return <EmptyState icon={CheckCircle2} title="No blockers" description="Nothing is currently blocking internal review readiness." />;
  }
  const sorted = [...blockers].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  return (
    <ol className="space-y-2">
      {sorted.map((b, i) => (
        <li key={i} className="rounded-gov border border-gov-border bg-white p-3">
          <div className="mb-1 flex items-center gap-2">
            <SeverityBadge severity={b.severity} />
            <span className="text-sm font-semibold text-navy-900">{b.requirement}</span>
            <span className="text-xs text-gov-muted">· {b.state}</span>
          </div>
          <p className="text-xs text-gov-muted"><span className="font-semibold text-saffron-700">Action required:</span> {b.action}</p>
        </li>
      ))}
    </ol>
  );
}
