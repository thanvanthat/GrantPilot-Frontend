import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// Status code -> translation key. Internal values never change; only the
// displayed label is localised.
const STATUS_I18N = {
  Matched: 'status.match.Matched', Partial: 'status.match.Partial', Gap: 'status.match.Gap',
  Missing: 'status.match.Missing', Review: 'status.match.Review',
  pass: 'status.eligibility.PASS', partial: 'status.eligibility.PARTIAL', fail: 'status.eligibility.FAIL',
  PASS: 'status.eligibility.PASS', PARTIAL: 'status.eligibility.PARTIAL', FAIL: 'status.eligibility.FAIL', UNKNOWN: 'status.eligibility.UNKNOWN',
  ADDRESSED: 'status.compliance.ADDRESSED', NEEDS_REVIEW: 'status.compliance.NEEDS_REVIEW', MISSING: 'status.compliance.MISSING',
  AVAILABLE: 'status.match.Available',
};

// Normalises the various status vocabularies used across the app onto one
// visual language: green / amber / red.
const MAP = {
  // match analysis
  Matched: { tone: 'green', icon: CheckCircle2, label: 'Matched' },
  Partial: { tone: 'amber', icon: AlertTriangle, label: 'Partial' },
  Gap: { tone: 'red', icon: XCircle, label: 'Gap' },
  Missing: { tone: 'red', icon: XCircle, label: 'Missing' },
  Review: { tone: 'amber', icon: AlertTriangle, label: 'Review' },
  // eligibility (lower + upper vocabularies)
  pass: { tone: 'green', icon: CheckCircle2, label: 'Pass' },
  partial: { tone: 'amber', icon: AlertTriangle, label: 'Partial' },
  fail: { tone: 'red', icon: XCircle, label: 'Fail' },
  PASS: { tone: 'green', icon: CheckCircle2, label: 'PASS' },
  PARTIAL: { tone: 'amber', icon: AlertTriangle, label: 'PARTIAL' },
  FAIL: { tone: 'red', icon: XCircle, label: 'FAIL' },
  UNKNOWN: { tone: 'gray', icon: MinusCircle, label: 'UNKNOWN' },
  // compliance item statuses (icon + text, never colour alone)
  ADDRESSED: { tone: 'green', icon: CheckCircle2, label: 'ADDRESSED' },
  NEEDS_REVIEW: { tone: 'amber', icon: Info, label: 'NEEDS REVIEW' },
  AVAILABLE: { tone: 'green', icon: CheckCircle2, label: 'AVAILABLE' },
  // compliance
  warning: { tone: 'amber', icon: AlertTriangle, label: 'Warning' },
};

const TONES = {
  green: 'bg-gov-greenLight text-gov-green',
  amber: 'bg-gov-amberLight text-gov-amber',
  red: 'bg-gov-redLight text-gov-red',
  gray: 'bg-slate-100 text-slate-600',
};

export function StatusPill({ status, label, className }) {
  const { t } = useLanguage();
  const cfg = MAP[status] || { tone: 'gray', icon: MinusCircle, label: status };
  const Icon = cfg.icon;
  const display = label || (STATUS_I18N[status] ? t(STATUS_I18N[status]) : cfg.label);
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[cfg.tone], className)}>
      <Icon className="h-3.5 w-3.5" />
      {display}
    </span>
  );
}

const SEVERITY_TONES = {
  HIGH: 'bg-gov-redLight text-gov-red',
  MEDIUM: 'bg-gov-amberLight text-gov-amber',
  LOW: 'bg-slate-100 text-slate-600',
};

export function SeverityBadge({ severity, className }) {
  const { t } = useLanguage();
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide', SEVERITY_TONES[severity] || SEVERITY_TONES.LOW, className)}>
      {t(`status.priority.${severity}`)}
    </span>
  );
}

const PRIORITY_TONES = {
  CRITICAL: 'bg-gov-redLight text-gov-red',
  HIGH: 'bg-saffron-50 text-saffron-700',
  MEDIUM: 'bg-gov-amberLight text-gov-amber',
  LOW: 'bg-slate-100 text-slate-600',
};

export function PriorityBadge({ priority, className }) {
  const { t } = useLanguage();
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', PRIORITY_TONES[priority] || PRIORITY_TONES.LOW, className)}>
      {t(`status.priority.${priority}`)}
    </span>
  );
}
