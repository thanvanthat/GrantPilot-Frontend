import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { SeverityBadge } from '@/components/common/StatusPill';
import { cn } from '@/lib/utils';

const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 };

/**
 * Submission readiness summary: completion %, status, and the blocking items
 * (incomplete sections, thin sections, and unresolved qualification gaps).
 * @param {{ readiness:number, status:string, blockers:any[] }} props
 */
export function ProposalReadiness({ readiness, status, blockers = [] }) {
  const highCount = blockers.filter((b) => b.severity === 'High').length;
  const sorted = [...blockers].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const ready = readiness >= 100 && highCount === 0;

  return (
    <div className="rounded-gov border border-gov-border bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">Submission readiness</p>
          <p className="text-2xl font-extrabold text-navy-900">{readiness}%</p>
        </div>
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
          ready ? 'bg-gov-greenLight text-gov-green' : 'bg-gov-amberLight text-gov-amber',
        )}>
          {ready ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {ready ? 'Ready to finalise' : `${status} · ${highCount} critical`}
        </span>
      </div>
      <Progress value={readiness} barClassName="bg-saffron-500" />

      {sorted.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-muted">Before submission ({sorted.length})</p>
          <ul className="space-y-1.5">
            {sorted.map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gov-ink">
                <SeverityBadge severity={b.severity} />
                <span>{b.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gov-green">
          <ShieldCheck className="h-4 w-4" /> All sections complete and no unresolved blockers.
        </p>
      )}
    </div>
  );
}
