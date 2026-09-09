import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/common/StatusPill';
import { HealthBadge, DeadlineBadge } from '@/components/pipeline/StatusBadges';
import { EmptyState } from '@/components/common/EmptyState';

/**
 * Ranked "priority for review" list. Decision support, not an automated
 * business decision.
 * @param {{ rows: import('@/types').PortfolioRow[] }} props
 */
export function PriorityOpportunities({ rows = [] }) {
  const navigate = useNavigate();
  if (!rows.length) {
    return <EmptyState title="No priority opportunities" description="Analyse opportunities to surface priorities for review." />;
  }
  return (
    <ol className="space-y-2">
      {rows.map((r, i) => (
        <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-gov border border-gov-border bg-white p-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-50 text-sm font-bold text-navy-900">{i + 1}</span>
          <button type="button" onClick={() => navigate(`/opportunities/${r.id}`)} className="min-w-[12rem] flex-1 text-left text-sm font-semibold text-navy-900 hover:text-saffron-600">
            {r.title}
            <span className="ml-2 text-xs font-normal text-gov-muted">{r.analyzed ? `${r.matchScore}% match` : 'Not analyzed'}</span>
          </button>
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={r.priority} />
            <DeadlineBadge state={r.deadlineState} days={r.deadline} />
            <HealthBadge health={r.health} />
          </div>
        </li>
      ))}
    </ol>
  );
}
