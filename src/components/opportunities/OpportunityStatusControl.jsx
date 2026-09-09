import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

const STATUSES = ['New', 'Reviewing', 'Pursuing', 'Skipped'];

const TONE = {
  New: 'bg-slate-100 text-slate-600 border-slate-300',
  Reviewing: 'bg-navy-50 text-navy-900 border-navy-900/20',
  Pursuing: 'bg-gov-greenLight text-gov-green border-gov-green/30',
  Skipped: 'bg-gov-redLight text-gov-red border-gov-red/30',
};

/** Read-only coloured badge for an opportunity status. */
export function OpportunityStatusBadge({ status = 'New', className }) {
  const { t } = useLanguage();
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', TONE[status], className)}>
      {t(`status.pipeline.${status}`)}
    </span>
  );
}

/** Segmented control to change an opportunity's status. */
export function OpportunityStatusControl({ value = 'New', onChange, className }) {
  const { t } = useLanguage();
  return (
    <div className={cn('inline-flex flex-wrap gap-1 rounded-gov border border-gov-border bg-white p-1', className)}>
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={cn(
            'rounded px-3 py-1 text-xs font-semibold transition-colors',
            value === s ? cn(TONE[s], 'border') : 'border border-transparent text-gov-muted hover:bg-gov-bg',
          )}
        >
          {t(`status.pipeline.${s}`)}
        </button>
      ))}
    </div>
  );
}
