import { StatusPill } from '@/components/common/StatusPill';
import { EmptyState } from '@/components/common/EmptyState';
import { FileText } from 'lucide-react';

/**
 * Required documents vs uploaded documents (from shared Context).
 * @param {{ documents: import('@/types').DocumentVerificationItem[] }} props
 */
export function DocumentVerification({ documents = [] }) {
  if (!documents.length) {
    return <EmptyState icon={FileText} title="No required documents" description="This opportunity lists no required documents." />;
  }
  return (
    <div className="overflow-hidden rounded-gov border border-gov-border bg-white">
      <ul className="divide-y divide-gov-border">
        {documents.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-[14rem] flex-1">
              <p className="text-sm font-medium text-navy-900">{d.required}</p>
              <p className="text-xs text-gov-muted">
                {d.matchedDocument ? `Linked: ${d.matchedDocument}` : 'No uploaded document linked'}
              </p>
            </div>
            <StatusPill status={d.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
