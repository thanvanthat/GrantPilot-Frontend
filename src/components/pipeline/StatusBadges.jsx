import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

const HEALTH = {
  HEALTHY: 'bg-gov-greenLight text-gov-green',
  NEEDS_ATTENTION: 'bg-gov-amberLight text-gov-amber',
  BLOCKED: 'bg-gov-redLight text-gov-red',
};

export function HealthBadge({ health, className }) {
  const { t } = useLanguage();
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold', HEALTH[health] || HEALTH.NEEDS_ATTENTION, className)}>{t(`status.health.${health}`)}</span>;
}

const DEADLINE = {
  PAST: 'bg-gov-redLight text-gov-red',
  DUE_SOON: 'bg-gov-amberLight text-gov-amber',
  UPCOMING: 'bg-slate-100 text-slate-600',
};
const DEADLINE_LABEL = { PAST: 'Past', DUE_SOON: 'Due soon', UPCOMING: 'Upcoming' };

export function DeadlineBadge({ state, days, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold', DEADLINE[state] || DEADLINE.UPCOMING, className)}>
      {DEADLINE_LABEL[state]}{typeof days === 'number' ? ` · ${days}d` : ''}
    </span>
  );
}
