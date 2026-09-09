import { cn } from '@/lib/utils';

const CLASS_COLORS = {
  Strong: { ring: '#2E7D32', text: 'text-gov-green', chip: 'bg-gov-greenLight text-gov-green' },
  Moderate: { ring: '#B45309', text: 'text-gov-amber', chip: 'bg-gov-amberLight text-gov-amber' },
  Weak: { ring: '#C24D10', text: 'text-saffron-700', chip: 'bg-saffron-50 text-saffron-700' },
  Low: { ring: '#C62828', text: 'text-gov-red', chip: 'bg-gov-redLight text-gov-red' },
};

/** Prominent circular overall match score. */
export function MatchScorePanel({ score, matchClass }) {
  const c = CLASS_COLORS[matchClass] || CLASS_COLORS.Low;
  const safeScore = Number.isFinite(score) ? score : 0;
  const size = 132;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, safeScore)) / 100);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Match score ${safeScore} percent`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.ring} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-extrabold leading-none', c.text)}>{safeScore}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">Overall Match Score</p>
        <p className={cn('mt-1 inline-flex rounded-full px-3 py-1 text-sm font-bold', c.chip)}>{matchClass} Match</p>
        <p className="mt-2 max-w-xs text-xs text-gov-muted">
          Weighted across technical, sector, capability, experience and eligibility fit.
        </p>
      </div>
    </div>
  );
}
