import { cn } from '@/lib/utils';

function Stat({ label, value, tone = 'navy' }) {
  const tones = {
    navy: 'text-navy-900',
    green: 'text-gov-green',
    amber: 'text-gov-amber',
    red: 'text-gov-red',
  };
  return (
    <div className="rounded-gov border border-gov-border bg-white p-4 text-center shadow-card">
      <p className={cn('text-2xl font-extrabold', tones[tone])}>{value}</p>
      <p className="mt-1 text-xs font-medium text-gov-muted">{label}</p>
    </div>
  );
}

/** Summary cards for the compliance workspace. */
export function ComplianceSummary({ result }) {
  const c = result.counts;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Internal Compliance Readiness" value={`${result.readinessScore}%`} tone="navy" />
      <Stat label="Addressed" value={c.addressed} tone="green" />
      <Stat label="Partial" value={c.partial} tone="amber" />
      <Stat label="Missing" value={c.missing} tone="red" />
      <Stat label="Needs Review" value={c.needsReview} tone="amber" />
      <Stat label="Open Risks" value={c.openRisks} tone={c.openRisks ? 'red' : 'green'} />
    </div>
  );
}
