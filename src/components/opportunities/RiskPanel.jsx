import { SeverityBadge } from '@/components/common/StatusPill';

/**
 * Qualification risks with severity, explanation and a review action.
 * @param {{ risks: import('@/types').QualificationResult['risks'] }} props
 */
export function RiskPanel({ risks = [] }) {
  return (
    <div className="space-y-3">
      {risks.map((r, i) => (
        <div key={i} className="rounded-gov border border-gov-border bg-white p-4">
          <div className="mb-1 flex items-center gap-2">
            <SeverityBadge severity={r.severity} />
            <p className="text-sm font-bold text-navy-900">{r.title}</p>
          </div>
          <p className="text-sm text-gov-ink">{r.explanation}</p>
          <p className="mt-1.5 text-xs text-gov-muted"><span className="font-semibold">Recommended review:</span> {r.recommendedAction}</p>
        </div>
      ))}
    </div>
  );
}
