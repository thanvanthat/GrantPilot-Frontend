import { RecommendationBadge } from '@/components/common/RecommendationBadge';
import { cn } from '@/lib/utils';

const BG = {
  PURSUE: 'bg-gov-greenLight border-gov-green/30',
  REVIEW: 'bg-gov-amberLight border-gov-amber/30',
  SKIP: 'bg-gov-redLight border-gov-red/30',
};
const CONF_TONE = {
  HIGH: 'bg-gov-greenLight text-gov-green',
  MEDIUM: 'bg-gov-amberLight text-gov-amber',
  LOW: 'bg-slate-100 text-slate-600',
};

/**
 * Prominent final recommendation with confidence, reasons and cautions.
 * @param {{ result: import('@/types').QualificationResult }} props
 */
export function RecommendationPanel({ result }) {
  const positives = result.evidence.filter((e) => e.polarity === 'positive').slice(0, 3);
  const cautions = result.evidence.filter((e) => e.polarity === 'caution').slice(0, 3);

  return (
    <div className={cn('rounded-gov border p-5', BG[result.recommendation])}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RecommendationBadge recommendation={result.recommendation} size="lg" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">Recommendation</p>
            <p className="text-sm font-medium text-gov-ink">{result.reason}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">Confidence</p>
          <span className={cn('mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold', CONF_TONE[result.confidence])}>{result.confidence}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {positives.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gov-muted">Why</p>
            <ul className="space-y-1 text-sm text-gov-ink">
              {positives.map((e, i) => <li key={i}>• {e.text}</li>)}
            </ul>
          </div>
        )}
        {cautions.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gov-muted">Attention</p>
            <ul className="space-y-1 text-sm text-gov-ink">
              {cautions.map((e, i) => <li key={i}>• {e.text}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
