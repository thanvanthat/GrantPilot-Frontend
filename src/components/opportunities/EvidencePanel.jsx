import { CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Explains WHY — reasons for a strong match and cautions against a full match.
 * @param {{ evidence: import('@/types').QualificationResult['evidence'], matchClass: string }} props
 */
export function EvidencePanel({ evidence = [], matchClass }) {
  const positives = evidence.filter((e) => e.polarity === 'positive');
  const cautions = evidence.filter((e) => e.polarity === 'caution');

  return (
    <div className="space-y-4">
      <p className="text-xs text-gov-muted">Based on the startup profile and uploaded documents:</p>

      {positives.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-green">
            Why this is a {matchClass ? matchClass.toLowerCase() : ''} match
          </h4>
          <ul className="space-y-1.5">
            {positives.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gov-ink">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gov-green" />{e.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cautions.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gov-amber">Why not a full match</h4>
          <ul className="space-y-1.5">
            {cautions.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gov-ink">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gov-amber" />{e.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
