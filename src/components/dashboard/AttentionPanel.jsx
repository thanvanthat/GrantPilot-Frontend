import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusPill';
import { EmptyState } from '@/components/common/EmptyState';

/**
 * Opportunities needing attention, each with a reason and recommended action.
 * @param {{ items: any[], limit?: number }} props
 */
export function AttentionPanel({ items = [], limit }) {
  const navigate = useNavigate();
  const shown = limit ? items.slice(0, limit) : items;

  if (!items.length) {
    return <EmptyState icon={CheckCircle2} title="Nothing needs attention" description="No opportunities currently require action." />;
  }

  return (
    <ul className="space-y-2">
      {shown.map((it, i) => (
        <li key={`${it.id}-${i}`} className="flex flex-wrap items-center justify-between gap-3 rounded-gov border border-gov-border bg-white p-3">
          <div className="min-w-[14rem] flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <SeverityBadge severity={it.severity} />
              <p className="text-sm font-semibold text-navy-900">{it.title}</p>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-gov-muted"><AlertTriangle className="h-3 w-3" />{it.reason}</p>
          </div>
          <button type="button" onClick={() => navigate(it.to)} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-saffron-600 hover:underline">
            {it.action} <ArrowRight className="h-3 w-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
