import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { readinessLabel } from '@/utils/complianceEngine';
import { cn } from '@/lib/utils';

const STATUS_STYLE = {
  READY: { ring: '#2E7D32', chip: 'bg-gov-greenLight text-gov-green', icon: ShieldCheck },
  MINOR_REVIEW: { ring: '#B45309', chip: 'bg-gov-amberLight text-gov-amber', icon: AlertTriangle },
  NEEDS_ATTENTION: { ring: '#C24D10', chip: 'bg-saffron-50 text-saffron-700', icon: AlertTriangle },
  NOT_READY: { ring: '#C62828', chip: 'bg-gov-redLight text-gov-red', icon: XCircle },
};

function Ring({ value, color }) {
  const size = 120, stroke = 11, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const safe = Number.isFinite(value) ? value : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Readiness ${safe} percent`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.max(0, Math.min(100, safe)) / 100)}
          strokeLinecap="round" className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-extrabold text-navy-900">{safe}%</span>
      </div>
    </div>
  );
}

/**
 * The internal-review readiness gate — the most important output.
 * @param {{ result: import('@/types').ComplianceResult }} props
 */
export function ReadinessGate({ result }) {
  const style = STATUS_STYLE[result.readinessStatus] || STATUS_STYLE.NOT_READY;
  const Icon = style.icon;
  const { checks, ready } = result.gate;

  return (
    <div className="rounded-gov border border-gov-border bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-6">
        <Ring value={result.readinessScore} color={style.ring} />
        <div className="min-w-[14rem] flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">Internal Review Readiness</p>
          <p className={cn('mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold', style.chip)}>
            <Icon className="h-4 w-4" />
            {ready ? 'Ready for Internal Review' : readinessLabel(result.readinessStatus)}
          </p>
          <ul className="mt-4 space-y-1.5">
            {checks.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                {c.pass
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-green" />
                  : <XCircle className="h-4 w-4 shrink-0 text-gov-red" />}
                <span className={c.pass ? 'text-gov-ink' : 'font-medium text-navy-900'}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 border-t border-gov-border pt-3 text-xs text-gov-muted">
        Final submission should be completed through the authorized government / procurement process after
        responsible-team approval. This is an internal review readiness indicator, not an official compliance determination.
      </p>
    </div>
  );
}
