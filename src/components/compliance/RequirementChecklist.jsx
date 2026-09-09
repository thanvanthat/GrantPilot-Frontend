import { StatusPill, PriorityBadge } from '@/components/common/StatusPill';
import { EmptyState } from '@/components/common/EmptyState';
import { ChevronRight } from 'lucide-react';

const CATEGORY_ORDER = ['Eligibility', 'Technical', 'Capability', 'Certification', 'Experience', 'Financial', 'Documentation', 'Submission'];

const REVIEWER_LABEL = {
  PENDING: 'Pending review',
  REVIEWED: 'Reviewed',
  NEEDS_CLARIFICATION: 'Needs clarification',
};

/**
 * Requirement checklist grouped by category. Items are pre-filtered by the page.
 * @param {{ items: import('@/types').ComplianceItem[], onSelect: Function }} props
 */
export function RequirementChecklist({ items = [], onSelect }) {
  if (!items.length) {
    return <EmptyState title="No requirements match" description="No requirements match the current filters or search." />;
  }
  const grouped = items.reduce((acc, it) => { (acc[it.category] = acc[it.category] || []).push(it); return acc; }, {});
  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-muted">{cat} ({grouped[cat].length})</h4>
          <div className="overflow-hidden rounded-gov border border-gov-border bg-white">
            <ul className="divide-y divide-gov-border">
              {grouped[cat].map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(it)}
                    className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gov-bg"
                  >
                    <div className="min-w-[14rem] flex-1">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={it.priority} />
                        <p className="text-sm font-medium text-navy-900">{it.requirement}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-gov-muted">
                        Evidence: {it.evidence} · <span className="italic">{REVIEWER_LABEL[it.reviewerState]}</span>
                      </p>
                    </div>
                    <StatusPill status={it.status} />
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
