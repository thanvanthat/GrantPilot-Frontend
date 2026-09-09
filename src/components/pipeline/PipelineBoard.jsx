import { useNavigate } from 'react-router-dom';
import { Building2, IndianRupee, ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectorBadge } from '@/components/common/SectorBadge';
import { StatusPill, PriorityBadge } from '@/components/common/StatusPill';
import { RecommendationBadge } from '@/components/common/RecommendationBadge';
import { HealthBadge, DeadlineBadge } from '@/components/pipeline/StatusBadges';
import { Select } from '@/components/ui/input';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const COLUMNS = ['New', 'Reviewing', 'Pursuing', 'Skipped'];
const COLUMN_ACCENT = {
  New: 'border-t-slate-300',
  Reviewing: 'border-t-navy-900',
  Pursuing: 'border-t-gov-green',
  Skipped: 'border-t-gov-red',
};

function PipelineCard({ row }) {
  const navigate = useNavigate();
  const { markOpportunityStatus, showToast } = useApp();

  function move(status) {
    markOpportunityStatus(row.id, status);
    showToast(`Opportunity moved to ${status}.`);
  }

  return (
    <div className="rounded-gov border border-gov-border bg-white p-3.5 shadow-card">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <SectorBadge sector={row.sector} />
        <DeadlineBadge state={row.deadlineState} days={row.deadline} />
      </div>
      <button
        type="button"
        onClick={() => navigate(`/opportunities/${row.id}`)}
        className="text-left text-sm font-bold text-navy-900 hover:text-saffron-600"
      >
        {row.title}
      </button>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-gov-muted"><Building2 className="h-3 w-3" />{row.organization}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gov-muted">
        <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{row.budget}</span>
      </div>

      {/* Signals */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {row.analyzed ? (
          <>
            <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-bold text-navy-900">{row.matchScore}% match</span>
            <StatusPill status={row.eligibility} />
            <RecommendationBadge recommendation={row.recommendation} />
          </>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Not analyzed</span>
        )}
      </div>

      {(row.proposal || row.compliance) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gov-muted">
          {row.proposal && <span>Proposal <span className="font-bold text-navy-900">{row.proposalReadiness}%</span></span>}
          {row.compliance && <span>Compliance <span className="font-bold text-navy-900">{row.complianceReadiness}%</span></span>}
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={row.priority} />
        <HealthBadge health={row.health} />
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gov-border pt-2.5">
        <button type="button" onClick={() => navigate(`/opportunities/${row.id}`)} className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 hover:underline">
          View <ArrowRight className="h-3 w-3" />
        </button>
        {row.proposal && (
          <button type="button" onClick={() => navigate(`/proposals/${row.id}`)} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline">
            <FileText className="h-3 w-3" /> Proposal
          </button>
        )}
        {row.compliance && (
          <button type="button" onClick={() => navigate(`/compliance?opportunity=${row.id}`)} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline">
            <ShieldCheck className="h-3 w-3" /> Compliance
          </button>
        )}
      </div>
      <div className="mt-2">
        <label className="sr-only" htmlFor={`move-${row.id}`}>Move {row.title} to status</label>
        <Select id={`move-${row.id}`} value={row.status} onChange={(e) => move(e.target.value)} className="h-8 text-xs">
          {COLUMNS.map((s) => <option key={s} value={s}>Move to: {s}</option>)}
        </Select>
      </div>
    </div>
  );
}

/** Kanban board: one column per status. */
export function PipelineBoard({ rows }) {
  const byStatus = COLUMNS.reduce((acc, s) => { acc[s] = rows.filter((r) => r.status === s); return acc; }, {});

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => (
        <div key={col} className={cn('rounded-gov border border-gov-border border-t-4 bg-gov-bg/60 p-3', COLUMN_ACCENT[col])}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">{col}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gov-muted">{byStatus[col].length}</span>
          </div>
          <div className="space-y-3">
            {byStatus[col].length === 0
              ? <p className="rounded-gov border border-dashed border-gov-border py-6 text-center text-xs text-gov-muted">No opportunities</p>
              : byStatus[col].map((row) => <PipelineCard key={row.id} row={row} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
