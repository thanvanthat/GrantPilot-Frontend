import { StatusPill } from '@/components/common/StatusPill';

const CATEGORY_ORDER = ['Technical', 'Capability', 'Certification', 'Eligibility', 'Experience', 'Financial', 'Documentation', 'Submission'];

/**
 * All requirements grouped by category, each with status + evidence + remarks.
 * @param {{ requirements: import('@/types').QualificationResult['requirements'] }} props
 */
export function RequirementAnalysis({ requirements = [] }) {
  const grouped = requirements.reduce((acc, r) => {
    (acc[r.category] = acc[r.category] || []).push(r);
    return acc;
  }, {});
  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-muted">{cat}</h4>
          <div className="overflow-hidden rounded-gov border border-gov-border bg-white">
            <ul className="divide-y divide-gov-border">
              {grouped[cat].map((r, i) => (
                <li key={`${cat}-${i}`} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-[14rem] flex-1">
                    <p className="text-sm font-medium text-navy-900">{r.requirement}</p>
                    {r.evidence ? <p className="text-xs text-gov-muted">Evidence: {r.evidence}</p> : null}
                    {r.remarks ? <p className="mt-0.5 text-[11px] text-slate-400">{r.remarks}</p> : null}
                  </div>
                  <StatusPill status={r.status} className="shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
