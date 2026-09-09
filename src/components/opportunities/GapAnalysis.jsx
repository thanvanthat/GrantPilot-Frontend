import { SeverityBadge } from '@/components/common/StatusPill';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckCircle2 } from 'lucide-react';

const CATEGORY_LABEL = {
  Capability: 'Capability Gaps',
  Certification: 'Certification Gaps',
  Documentation: 'Document Gaps',
  Experience: 'Experience Gaps',
};
const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 };

/**
 * What the startup still needs before pursuing, grouped by category.
 * @param {{ gaps: import('@/types').QualificationResult['gaps'] }} props
 */
export function GapAnalysis({ gaps = [] }) {
  if (!gaps.length) {
    return <EmptyState icon={CheckCircle2} title="No gaps identified" description="The profile addresses the requirements found in this opportunity." />;
  }
  const grouped = gaps.reduce((acc, g) => { (acc[g.category] = acc[g.category] || []).push(g); return acc; }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-muted">{CATEGORY_LABEL[cat] || `${cat} Gaps`}</h4>
          <ul className="space-y-2">
            {[...items].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]).map((g, i) => (
              <li key={`${cat}-${i}`} className="rounded-gov border border-gov-border bg-white p-3">
                <div className="mb-1 flex items-center gap-2">
                  <SeverityBadge severity={g.severity} />
                  <p className="text-sm font-semibold text-navy-900">{g.description}</p>
                </div>
                <p className="text-xs text-gov-muted"><span className="font-semibold">Suggested action:</span> {g.suggestedAction}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
