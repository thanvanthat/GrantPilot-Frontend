import { StatusPill, PriorityBadge } from '@/components/common/StatusPill';
import { RecommendationBadge } from '@/components/common/RecommendationBadge';
import { HealthBadge } from '@/components/pipeline/StatusBadges';
import { OpportunityStatusBadge } from '@/components/opportunities/OpportunityStatusControl';

const NA = <span className="text-slate-400">Not analyzed</span>;

/** Side-by-side comparison. Missing values render as "Not analyzed". */
export function ComparisonTable({ rows }) {
  const cell = (r, render) => <td key={r.id} className="border-l border-gov-border px-4 py-2.5 align-top">{render(r)}</td>;

  const ROWS = [
    ['Sector', (r) => r.sector],
    ['Budget', (r) => r.budget],
    ['Deadline', (r) => `${r.deadline} days`],
    ['Match Score', (r) => (r.analyzed ? <span className="font-bold text-navy-900">{r.matchScore}%</span> : NA)],
    ['Technical Fit', (r) => (r.analyzed ? `${r.scoreBreakdown.technical.score}%` : NA)],
    ['Sector Fit', (r) => (r.analyzed ? `${r.scoreBreakdown.sector.score}%` : NA)],
    ['Experience Fit', (r) => (r.analyzed ? `${r.scoreBreakdown.experience.score}%` : NA)],
    ['Eligibility', (r) => (r.analyzed ? <StatusPill status={r.eligibility} /> : NA)],
    ['Gaps', (r) => (r.analyzed ? `${r.gapsCount} (${r.gapsHigh} high)` : NA)],
    ['Open Risks', (r) => (r.compliance ? r.openRisks : NA)],
    ['Proposal Readiness', (r) => (r.proposal ? `${r.proposalReadiness}%` : <span className="text-slate-400">No proposal</span>)],
    ['Compliance Readiness', (r) => (r.compliance ? `${r.complianceReadiness}%` : <span className="text-slate-400">Not reviewed</span>)],
    ['Recommendation', (r) => (r.analyzed ? <RecommendationBadge recommendation={r.recommendation} /> : NA)],
    ['Pipeline Status', (r) => <OpportunityStatusBadge status={r.status} />],
    ['Priority', (r) => <PriorityBadge priority={r.priority} />],
    ['Health', (r) => <HealthBadge health={r.health} />],
  ];

  return (
    <div className="overflow-x-auto rounded-gov border border-gov-border bg-white">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead>
          <tr className="border-b border-gov-border bg-gov-bg">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gov-muted">Metric</th>
            {rows.map((r) => (
              <th key={r.id} className="border-l border-gov-border px-4 py-3 text-sm font-bold text-navy-900">{r.title}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gov-border">
          {ROWS.map(([label, render]) => (
            <tr key={label}>
              <td className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gov-muted">{label}</td>
              {rows.map((r) => cell(r, render))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
