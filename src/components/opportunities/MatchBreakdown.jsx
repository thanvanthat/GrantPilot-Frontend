import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const LABELS = {
  technical: 'Technical Fit',
  sector: 'Sector Fit',
  capability: 'Capability Fit',
  experience: 'Experience Fit',
  eligibility: 'Eligibility Fit',
};

const STATUS_TONE = {
  Strong: 'text-gov-green',
  Moderate: 'text-gov-amber',
  Weak: 'text-saffron-700',
  Low: 'text-gov-red',
};

function barColor(score) {
  return score >= 80 ? 'bg-gov-green' : score >= 60 ? 'bg-gov-amber' : score >= 40 ? 'bg-saffron-500' : 'bg-gov-red';
}

/**
 * Score breakdown grid. Values come from the qualification result — never
 * hardcoded here.
 * @param {{ breakdown: import('@/types').QualificationResult['scoreBreakdown'] }} props
 */
export function MatchBreakdown({ breakdown }) {
  const entries = Object.entries(LABELS);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {entries.map(([key, label]) => {
        const item = breakdown[key];
        return (
          <div key={key} className="rounded-gov border border-gov-border bg-white p-4">
            <p className="text-xs font-medium text-gov-muted">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-navy-900">{item.score}%</p>
            <p className={cn('text-xs font-bold', STATUS_TONE[item.status])}>{item.status}</p>
            <Progress value={item.score} barClassName={barColor(item.score)} className="mt-2" />
            <p className="mt-2 text-[11px] leading-snug text-gov-muted">{item.explanation}</p>
          </div>
        );
      })}
    </div>
  );
}
