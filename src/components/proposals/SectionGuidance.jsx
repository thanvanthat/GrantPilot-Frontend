import { Lightbulb, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusPill';

/**
 * Qualification-derived writing guidance for the active proposal section.
 * @param {{ guidance: { cite: string[], address: any[], note: string, hasQualification: boolean }, onRunQualification?: Function }} props
 */
export function SectionGuidance({ guidance, onRunQualification }) {
  if (!guidance) return null;

  return (
    <div className="rounded-gov border border-navy-100 bg-navy-50 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <Lightbulb className="h-4 w-4 text-saffron-600" /> Writing guidance
      </p>
      {guidance.note ? <p className="mt-1.5 text-sm text-navy-900/90">{guidance.note}</p> : null}

      {!guidance.hasQualification && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-gov-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Run qualification on this opportunity to get capability- and gap-specific guidance here.
          {onRunQualification ? (
            <button type="button" onClick={onRunQualification} className="ml-1 font-semibold text-saffron-600 hover:underline">
              Open qualification
            </button>
          ) : null}
        </p>
      )}

      {guidance.cite?.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gov-muted">Cite these matched capabilities</p>
          <div className="flex flex-wrap gap-1.5">
            {guidance.cite.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-gov-greenLight px-2.5 py-0.5 text-xs font-semibold text-gov-green">
                <CheckCircle2 className="h-3 w-3" />{c}
              </span>
            ))}
          </div>
        </div>
      )}

      {guidance.address?.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gov-muted">Address these gaps here</p>
          <ul className="space-y-1.5">
            {guidance.address.map((g, i) => (
              <li key={i} className="flex items-start gap-2 rounded-gov border border-gov-border bg-white p-2 text-xs">
                <SeverityBadge severity={g.severity} />
                <span className="text-gov-ink"><span className="font-semibold">{g.description}.</span> {g.suggestedAction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {guidance.hasQualification && !guidance.cite?.length && !guidance.address?.length && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-gov-green">
          <CheckCircle2 className="h-3.5 w-3.5" /> No specific gaps for this section — focus on clarity and evidence.
        </p>
      )}
    </div>
  );
}
