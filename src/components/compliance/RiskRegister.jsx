import { SeverityBadge } from '@/components/common/StatusPill';
import { Select } from '@/components/ui/input';
import { EmptyState } from '@/components/common/EmptyState';
import { ShieldCheck } from 'lucide-react';

const RISK_STATUSES = ['Open', 'In Progress', 'Resolved', 'Accepted'];
const ORDER = { High: 0, Medium: 1, Low: 2 };

/**
 * Requirement-linked compliance risks with a reviewer-controllable status.
 * @param {{ risks: import('@/types').ComplianceRisk[], onStatusChange: Function }} props
 */
export function RiskRegister({ risks = [], onStatusChange }) {
  const real = risks.filter((r) => r.id !== 'risk-none');
  if (!real.length) {
    return <EmptyState icon={ShieldCheck} title="No compliance risks identified" description="No compliance risks were produced from the current analysis." />;
  }
  const sorted = [...real].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  return (
    <div className="space-y-3">
      {sorted.map((r) => (
        <div key={r.id} className="rounded-gov border border-gov-border bg-white p-4">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={r.severity} />
              <p className="text-sm font-bold text-navy-900">{r.risk}</p>
            </div>
            <Select
              value={r.status}
              onChange={(e) => onStatusChange(r.id, e.target.value)}
              className="h-8 w-auto min-w-[9rem] text-xs"
              aria-label={`Status for risk: ${r.risk}`}
            >
              {RISK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <p className="text-xs text-gov-muted">Related requirement: <span className="font-medium text-gov-ink">{r.relatedRequirement}</span></p>
          <p className="mt-1 text-sm text-gov-ink"><span className="font-semibold">Impact:</span> {r.impact}</p>
          <p className="mt-1 text-xs text-gov-muted"><span className="font-semibold">Mitigation:</span> {r.mitigation}</p>
        </div>
      ))}
    </div>
  );
}
