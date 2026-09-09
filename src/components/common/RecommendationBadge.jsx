import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// PURSUE / REVIEW / SKIP — the headline verdict, styled prominently.
const REC = {
  PURSUE: { cls: 'bg-gov-greenLight text-gov-green border-gov-green/30', icon: CheckCircle2 },
  REVIEW: { cls: 'bg-gov-amberLight text-gov-amber border-gov-amber/30', icon: AlertTriangle },
  SKIP: { cls: 'bg-gov-redLight text-gov-red border-gov-red/30', icon: XCircle },
};

export function RecommendationBadge({ recommendation, size = 'default', className }) {
  const { t } = useLanguage();
  const cfg = REC[recommendation] || REC.REVIEW;
  const Icon = cfg.icon;
  const big = size === 'lg';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-extrabold tracking-wide',
      cfg.cls,
      big ? 'px-4 py-1.5 text-base' : 'px-3 py-0.5 text-sm',
      className,
    )}>
      <Icon className={big ? 'h-5 w-5' : 'h-4 w-4'} />
      {t(`status.recommendation.${recommendation}`)}
    </span>
  );
}
