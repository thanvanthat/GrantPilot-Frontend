import { X, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readinessLabel, complianceNextActions } from '@/utils/complianceEngine';

const CATEGORY_ORDER = ['Eligibility', 'Technical', 'Capability', 'Certification', 'Experience', 'Financial', 'Documentation', 'Submission'];

function buildReportText(result, profile) {
  const lines = [
    'GRANTPILOT — COMPLIANCE READINESS REPORT',
    'Internal review support document — not an official government compliance determination.',
    '',
    `Company: ${profile.companyName}`,
    `Opportunity: ${result.opportunityTitle}`,
    `Organisation: ${result.organization}`,
    `Internal Compliance Readiness: ${result.readinessScore}% — ${readinessLabel(result.readinessStatus)}`,
    `Proposal readiness: ${result.proposalReadiness}%`,
    `Generated: ${new Date(result.lastUpdated).toLocaleString('en-IN')}`,
    '',
    `Summary: ${result.counts.addressed} addressed, ${result.counts.partial} partial, ${result.counts.missing} missing, ${result.counts.needsReview} needs review, ${result.counts.openRisks} open risks.`,
    '',
    'REQUIREMENTS',
    ...result.items.map((i) => `  [${i.status}] (${i.priority}) ${i.category} — ${i.requirement} | ${i.evidence}`),
    '',
    'DOCUMENT VERIFICATION',
    ...result.documents.map((d) => `  [${d.status}] ${d.required}${d.matchedDocument ? ` (${d.matchedDocument})` : ''}`),
    '',
    'RISK REGISTER',
    ...result.risks.filter((r) => r.id !== 'risk-none').map((r) => `  (${r.severity}/${r.status}) ${r.risk} — ${r.mitigation}`),
    '',
    'BLOCKERS',
    ...(result.blockers.length ? result.blockers.map((b) => `  (${b.severity}) ${b.requirement} — ${b.action}`) : ['  None']),
    '',
    'REVIEWER NOTES',
    ...result.items.filter((i) => i.reviewerNote).map((i) => `  ${i.requirement}: ${i.reviewerNote}`),
    '',
    'NEXT ACTIONS',
    ...complianceNextActions(result).map((a, i) => `  ${i + 1}. ${a}`),
    '',
    'Final submission should be completed through the authorized government / procurement process after responsible-team approval.',
  ];
  return lines.join('\n');
}

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

/** Clean, document-style compliance report with print / download. */
export function CompliancePreview({ result, profile, onClose }) {
  const notes = result.items.filter((i) => i.reviewerNote);
  const grouped = result.items.reduce((acc, it) => { (acc[it.category] = acc[it.category] || []).push(it); return acc; }, {});
  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  function download() {
    const blob = new Blob([buildReportText(result, profile)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grantpilot-compliance-report-${result.opportunityId}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-200/70 p-4 sm:p-8">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <p className="text-sm font-semibold text-navy-900">Compliance Report Preview</p>
        <div className="flex gap-2">
          <Button variant="subtle" onClick={download}><Download className="h-4 w-4" /> Download (.txt)</Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Save as PDF</Button>
          <Button variant="outline" onClick={onClose}><X className="h-4 w-4" /> Close</Button>
        </div>
      </div>

      {/* Document */}
      <div className="print-report mx-auto max-w-3xl rounded-gov border border-slate-300 bg-white p-8 shadow-card">
        <div className="mb-6 border-b border-slate-300 pb-4">
          <p className="text-lg font-extrabold tracking-tight text-navy-900">GrantPilot — Compliance Readiness Report</p>
          <p className="mt-1 text-xs text-gov-muted">Internal review support document — not an official government compliance determination.</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gov-muted">Company:</span> <span className="font-semibold text-navy-900">{profile.companyName}</span></div>
          <div><span className="text-gov-muted">Opportunity:</span> <span className="font-semibold text-navy-900">{result.opportunityTitle}</span></div>
          <div><span className="text-gov-muted">Organisation:</span> <span className="font-semibold text-navy-900">{result.organization}</span></div>
          <div><span className="text-gov-muted">Proposal readiness:</span> <span className="font-semibold text-navy-900">{result.proposalReadiness}%</span></div>
        </div>

        <div className="mb-6 flex items-center gap-6 rounded-gov bg-gov-bg p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gov-muted">Internal Compliance Readiness</p>
            <p className="text-3xl font-extrabold text-navy-900">{result.readinessScore}%</p>
            <p className="text-sm font-semibold text-gov-ink">{readinessLabel(result.readinessStatus)}</p>
          </div>
          <div className="text-xs text-gov-ink">
            {result.counts.addressed} addressed · {result.counts.partial} partial · {result.counts.missing} missing ·
            {' '}{result.counts.needsReview} needs review · {result.counts.openRisks} open risks
          </div>
        </div>

        <Section title="Requirement-by-Requirement">
          {categories.map((cat) => (
            <div key={cat} className="mb-3">
              <p className="text-xs font-bold text-navy-900">{cat}</p>
              <table className="w-full text-left text-xs">
                <tbody>
                  {grouped[cat].map((i) => (
                    <tr key={i.id} className="border-b border-slate-100">
                      <td className="py-1 pr-2 font-medium text-navy-900">{i.requirement}</td>
                      <td className="py-1 pr-2 text-gov-muted">{i.priority}</td>
                      <td className="py-1 font-semibold">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </Section>

        <Section title="Document Verification">
          <table className="w-full text-left text-xs">
            <tbody>
              {result.documents.map((d) => (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="py-1 pr-2 text-navy-900">{d.required}</td>
                  <td className="py-1 font-semibold">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Risk Register">
          <ul className="space-y-1 text-xs">
            {result.risks.filter((r) => r.id !== 'risk-none').map((r) => (
              <li key={r.id}><span className="font-bold">[{r.severity}/{r.status}]</span> {r.risk} — {r.mitigation}</li>
            ))}
            {result.risks.every((r) => r.id === 'risk-none') && <li className="text-gov-muted">No compliance risks identified.</li>}
          </ul>
        </Section>

        <Section title="Blockers">
          {result.blockers.length ? (
            <ol className="list-decimal space-y-1 pl-5 text-xs">
              {result.blockers.map((b, i) => <li key={i}><span className="font-semibold">{b.requirement}</span> ({b.severity}) — {b.action}</li>)}
            </ol>
          ) : <p className="text-xs text-gov-muted">No blockers.</p>}
        </Section>

        {notes.length > 0 && (
          <Section title="Reviewer Notes">
            <ul className="space-y-1 text-xs">
              {notes.map((i) => <li key={i.id}><span className="font-semibold">{i.requirement}:</span> {i.reviewerNote}</li>)}
            </ul>
          </Section>
        )}

        <Section title="Next Actions">
          <ol className="list-decimal space-y-1 pl-5 text-xs">
            {complianceNextActions(result).map((a, i) => <li key={i}>{a}</li>)}
          </ol>
        </Section>

        <p className="mt-6 border-t border-slate-300 pt-3 text-[11px] text-gov-muted">
          GrantPilot provides AI-assisted compliance readiness analysis based on the information available in the workspace.
          Responsible team members must verify requirements, evidence and final submission details. Final submission should be
          completed through the authorized government / procurement process after responsible-team approval.
        </p>
      </div>
    </div>
  );
}
