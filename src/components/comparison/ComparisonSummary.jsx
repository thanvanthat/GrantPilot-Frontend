import { TrendingUp, ShieldCheck, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getComparisonMetrics } from '@/utils/comparisonEngine';

function Tile({ icon: Icon, label, row, value }) {
  return (
    <div className="rounded-gov border border-gov-border bg-white p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gov-muted">
        <Icon className="h-3.5 w-3.5" />{label}
      </p>
      {row ? (
        <>
          <p className="mt-1 text-sm font-bold text-navy-900">{value}</p>
          <p className="truncate text-xs text-gov-muted">{row.title}</p>
        </>
      ) : (
        <p className="mt-1 text-sm text-slate-400">No data available</p>
      )}
    </div>
  );
}

/** Descriptive "strongest signal" summary — never declares a winner. */
export function ComparisonSummary({ rows }) {
  const m = getComparisonMetrics(rows);
  return (
    <div>
      <p className="mb-2 text-xs text-gov-muted">Based on available information — the current strongest signals across the selected opportunities.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Tile icon={TrendingUp} label="Highest Match" row={m.highestMatch?.row} value={m.highestMatch ? `${m.highestMatch.value}%` : ''} />
        <Tile icon={CheckCircle2} label="Best Eligibility" row={m.bestEligibility?.row} value={m.bestEligibility?.value} />
        <Tile icon={AlertTriangle} label="Lowest Open Risk" row={m.lowestRisk?.row} value={m.lowestRisk ? `${m.lowestRisk.value} risk${m.lowestRisk.value === 1 ? '' : 's'}` : ''} />
        <Tile icon={FileText} label="Highest Proposal Readiness" row={m.highestProposalReadiness?.row} value={m.highestProposalReadiness ? `${m.highestProposalReadiness.value}%` : ''} />
        <Tile icon={ShieldCheck} label="Highest Compliance Readiness" row={m.highestComplianceReadiness?.row} value={m.highestComplianceReadiness ? `${m.highestComplianceReadiness.value}%` : ''} />
      </div>
    </div>
  );
}
