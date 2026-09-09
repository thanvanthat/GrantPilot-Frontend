import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, HelpCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { StatusPill, PriorityBadge } from '@/components/common/StatusPill';

const REVIEWER_LABEL = {
  PENDING: 'Pending review',
  REVIEWED: 'Reviewed',
  NEEDS_CLARIFICATION: 'Needs clarification',
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gov-muted">{label}</p>
      <div className="mt-0.5 text-sm text-gov-ink">{children}</div>
    </div>
  );
}

/**
 * Accessible dialog with full requirement detail + reviewer actions.
 * Reviewer actions set INTERNAL review state only — they do not change the
 * qualification result.
 */
export function RequirementDetail({ item, onClose, onReviewerState, onNote }) {
  const [note, setNote] = useState(item?.reviewerNote || '');
  const closeRef = useRef(null);

  useEffect(() => { setNote(item?.reviewerNote || ''); }, [item]);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/40 p-4 sm:p-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Requirement detail: ${item.requirement}`}
        className="w-full max-w-2xl animate-fade-in rounded-gov border border-gov-border bg-white shadow-cardHover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gov-border p-5">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <PriorityBadge priority={item.priority} />
              <span className="text-xs font-medium text-gov-muted">{item.category}</span>
            </div>
            <h2 className="text-base font-bold text-navy-900">{item.requirement}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-gov-muted hover:bg-gov-bg hover:text-navy-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Status"><StatusPill status={item.status} /></Field>
          <Field label="Reviewer state">
            <span className="font-semibold">{REVIEWER_LABEL[item.reviewerState]}</span>
          </Field>
          <Field label="Evidence source">{item.evidenceSource || '—'}</Field>
          <Field label="Qualification finding">{item.qualificationFinding || '—'}</Field>
          <div className="sm:col-span-2"><Field label="Evidence">{item.evidence || 'Not available'}</Field></div>
          {item.remarks ? <div className="sm:col-span-2"><Field label="Remarks">{item.remarks}</Field></div> : null}

          <div className="sm:col-span-2">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gov-muted">Reviewer note</p>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal reviewer note…" />
            <div className="mt-2">
              <Button variant="subtle" size="sm" onClick={() => onNote(item.id, note)}>
                <Save className="h-3.5 w-3.5" /> Save note
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gov-border p-5">
          <Button variant="navy" onClick={() => onReviewerState(item.id, 'REVIEWED')}>
            <CheckCircle2 className="h-4 w-4" /> Mark Reviewed
          </Button>
          <Button variant="outlineSaffron" onClick={() => onReviewerState(item.id, 'NEEDS_CLARIFICATION')}>
            <HelpCircle className="h-4 w-4" /> Needs Clarification
          </Button>
          {item.reviewerState !== 'PENDING' && (
            <Button variant="subtle" onClick={() => onReviewerState(item.id, 'PENDING')}>Reset to pending</Button>
          )}
          <p className="mt-2 w-full text-xs text-gov-muted">
            Reviewer actions set internal review state only — they do not change the qualification result.
          </p>
        </div>
      </div>
    </div>
  );
}
