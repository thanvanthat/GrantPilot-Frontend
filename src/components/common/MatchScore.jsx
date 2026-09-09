import { Progress } from '@/components/ui/progress';
import { cn, matchTier } from '@/lib/utils';

const TIER_STYLES = {
  strong: { text: 'text-gov-green', bar: 'bg-gov-green', chip: 'bg-gov-greenLight text-gov-green' },
  partial: { text: 'text-gov-amber', bar: 'bg-gov-amber', chip: 'bg-gov-amberLight text-gov-amber' },
  weak: { text: 'text-gov-red', bar: 'bg-gov-red', chip: 'bg-gov-redLight text-gov-red' },
};

export function matchStyles(score) {
  return TIER_STYLES[matchTier(score).tier];
}

/** Score percentage with a colour-coded progress bar and verdict label. */
export function MatchScore({ score, size = 'default', className }) {
  const { label } = matchTier(score);
  const styles = matchStyles(score);
  const big = size === 'lg';

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn('font-extrabold leading-none', styles.text, big ? 'text-4xl' : 'text-2xl')}>
          {score}%
        </span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', styles.chip)}>{label}</span>
      </div>
      <Progress value={score} barClassName={styles.bar} className={cn('mt-2', big && 'h-2.5')} />
    </div>
  );
}
