import { X, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

function buildText(report, profile) {
  const { pipeline, qual, proposal, compliance, sectors, priority, attention } = report;
  const L = [
    'GRANTPILOT — PORTFOLIO REPORT',
    'Government Opportunity Intelligence — internal decision-support document.',
    '',
    `Company: ${profile.companyName || '—'}`,
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    '',
    'EXECUTIVE SUMMARY',
    `  Total opportunities: ${pipeline.total}   Active: ${pipeline.active}`,
    `  Pursuing: ${pipeline.Pursuing.count}   Reviewing: ${pipeline.Reviewing.count}   Skipped: ${pipeline.Skipped.count}`,
    `  Avg match: ${qual.averageMatch}%   Avg proposal readiness: ${proposal.averageReadiness}%   Avg compliance readiness: ${compliance.averageReadiness}%`,
    '',
    'PIPELINE',
    `  New ${pipeline.New.count} (${pipeline.New.pct}%) | Reviewing ${pipeline.Reviewing.count} (${pipeline.Reviewing.pct}%) | Pursuing ${pipeline.Pursuing.count} (${pipeline.Pursuing.pct}%) | Skipped ${pipeline.Skipped.count} (${pipeline.Skipped.pct}%)`,
    '',
    'QUALIFICATION',
    `  Analyzed ${qual.analyzed} | Not analyzed ${qual.notAnalyzed} | Strong ${qual.strong} | Moderate ${qual.moderate} | Weak ${qual.weak}`,
    '',
    'PROPOSAL',
    `  Total ${proposal.total} | Draft ${proposal.draft} | In Review ${proposal.inReview} | Ready ${proposal.ready} | Avg ${proposal.averageReadiness}%`,
    '',
    'COMPLIANCE',
    `  Reviewed ${compliance.reviewed} | Ready ${compliance.ready} | Needs attention ${compliance.needsAttention} | Not ready ${compliance.notReady} | Avg ${compliance.averageReadiness}%`,
    '',
    'SECTOR DISTRIBUTION',
    ...sectors.map((s) => `  ${s.sector}: ${s.count} (${s.pct}%)`),
    '',
    'PRIORITY FOR REVIEW',
    ...priority.map((r, i) => `  ${i + 1}. ${r.title} — ${r.analyzed ? `${r.matchScore}% match` : 'not analyzed'}, priority ${r.priority}, ${r.health}`),
    '',
    'ATTENTION ITEMS',
    ...(attention.length ? attention.map((a) => `  (${a.severity}) ${a.title} — ${a.reason}`) : ['  None']),
    '',
    'Priority is decision support based on available information, not an automated business decision.',
  ];
  return L.join('\n');
}

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between border-b border-slate-100 py-1 text-xs">
      <span className="text-gov-muted">{label}</span>
      <span className="font-semibold text-navy-900">{children}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

/** Document-style portfolio report with print / download. */
export function ReportPreview({ report, profile, onClose }) {
  const { pipeline, qual, proposal, compliance, sectors, priority, attention } = report;

  function download() {
    const blob = new Blob([buildText(report, profile)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'grantpilot-portfolio-report.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-200/70 p-4 sm:p-8">
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <p className="text-sm font-semibold text-navy-900">Portfolio Report Preview</p>
        <div className="flex gap-2">
          <Button variant="subtle" onClick={download}><Download className="h-4 w-4" /> Download (.txt)</Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Save as PDF</Button>
          <Button variant="outline" onClick={onClose}><X className="h-4 w-4" /> Close</Button>
        </div>
      </div>

      <div className="print-report mx-auto max-w-3xl rounded-gov border border-slate-300 bg-white p-8 shadow-card">
        <div className="mb-5 border-b border-slate-300 pb-4">
          <p className="text-lg font-extrabold tracking-tight text-navy-900">GrantPilot — Portfolio Report</p>
          <p className="text-xs text-gov-muted">Government Opportunity Intelligence — internal decision-support document.</p>
          <p className="mt-2 text-xs text-gov-muted">Company: <span className="font-semibold text-navy-900">{profile.companyName || '—'}</span> · Generated {new Date().toLocaleString('en-IN')}</p>
        </div>

        <Section title="Executive Summary">
          <Row label="Total opportunities">{pipeline.total}</Row>
          <Row label="Active">{pipeline.active}</Row>
          <Row label="Pursuing / Reviewing / Skipped">{pipeline.Pursuing.count} / {pipeline.Reviewing.count} / {pipeline.Skipped.count}</Row>
          <Row label="Average match score">{qual.averageMatch}%</Row>
          <Row label="Average proposal readiness">{proposal.averageReadiness}%</Row>
          <Row label="Average compliance readiness">{compliance.averageReadiness}%</Row>
        </Section>

        <Section title="Pipeline">
          {['New', 'Reviewing', 'Pursuing', 'Skipped'].map((k) => (
            <Row key={k} label={k}>{pipeline[k].count} ({pipeline[k].pct}%)</Row>
          ))}
        </Section>

        <Section title="Qualification">
          <Row label="Analyzed / Not analyzed">{qual.analyzed} / {qual.notAnalyzed}</Row>
          <Row label="Strong / Moderate / Weak">{qual.strong} / {qual.moderate} / {qual.weak}</Row>
        </Section>

        <Section title="Proposal">
          <Row label="Total">{proposal.total}</Row>
          <Row label="Draft / In Review / Ready">{proposal.draft} / {proposal.inReview} / {proposal.ready}</Row>
        </Section>

        <Section title="Compliance">
          <Row label="Reviewed">{compliance.reviewed}</Row>
          <Row label="Ready / Needs attention / Not ready">{compliance.ready} / {compliance.needsAttention} / {compliance.notReady}</Row>
        </Section>

        <Section title="Sector Distribution">
          {sectors.map((s) => <Row key={s.sector} label={s.sector}>{s.count} ({s.pct}%)</Row>)}
        </Section>

        <Section title="Priority for Review">
          <ol className="list-decimal space-y-1 pl-5 text-xs">
            {priority.map((r) => <li key={r.id}>{r.title} — {r.analyzed ? `${r.matchScore}% match` : 'not analyzed'}, priority {r.priority}</li>)}
          </ol>
        </Section>

        <Section title="Attention Items">
          {attention.length ? (
            <ul className="space-y-1 text-xs">
              {attention.map((a, i) => <li key={i}><span className="font-bold">[{a.severity}]</span> {a.title} — {a.reason}</li>)}
            </ul>
          ) : <p className="text-xs text-gov-muted">None.</p>}
        </Section>

        <p className="mt-6 border-t border-slate-300 pt-3 text-[11px] text-gov-muted">
          Priority and health are AI-assisted decision support based on the information available in the workspace, not automated business decisions.
        </p>
      </div>
    </div>
  );
}
