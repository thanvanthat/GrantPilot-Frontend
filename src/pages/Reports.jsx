import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/common/SectionHeading';
import { AttentionPanel } from '@/components/dashboard/AttentionPanel';
import { PriorityOpportunities } from '@/components/reports/PriorityOpportunities';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { usePortfolioRows } from '@/hooks/usePortfolio';
import {
  calculatePipelineMetrics, calculateQualificationMetrics, calculateProposalMetrics,
  calculateComplianceMetrics, calculateSectorDistribution, calculateRecommendationDistribution,
  calculateMatchDistribution, calculateDeadlineMetrics, getAttentionItems, getPriorityOpportunities,
} from '@/utils/reportingEngine';
import { cn } from '@/lib/utils';

function Metric({ label, value, sub }) {
  return (
    <div className="rounded-gov border border-gov-border bg-white p-4">
      <p className="text-2xl font-extrabold text-navy-900">{value}</p>
      <p className="text-xs font-medium text-gov-muted">{label}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p> : null}
    </div>
  );
}

/** Horizontal CSS bar list — no chart library needed. */
function BarList({ data, total, colorClass = 'bg-saffron-500' }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-0.5 flex items-center justify-between text-xs">
            <span className="font-medium text-gov-ink">{d.label}</span>
            <span className="font-semibold text-navy-900">{d.count}{total ? ` (${Math.round((d.count / total) * 100)}%)` : ''}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={cn('h-full rounded-full', colorClass)} style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="heading-underline text-lg font-bold tracking-tight text-navy-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Reports() {
  const rows = usePortfolioRows();
  const { profile, proposals, complianceResults } = useApp();
  const [previewOpen, setPreviewOpen] = useState(false);

  const report = useMemo(() => ({
    pipeline: calculatePipelineMetrics(rows),
    qual: calculateQualificationMetrics(rows),
    proposal: calculateProposalMetrics(proposals),
    compliance: calculateComplianceMetrics(complianceResults),
    sectors: calculateSectorDistribution(rows),
    recommendation: calculateRecommendationDistribution(rows),
    match: calculateMatchDistribution(rows),
    deadline: calculateDeadlineMetrics(rows),
    attention: getAttentionItems(rows),
    priority: getPriorityOpportunities(rows, 5),
  }), [rows, proposals, complianceResults]);

  const { pipeline, qual, proposal, compliance, sectors, recommendation, match, deadline, attention, priority } = report;

  const recData = [
    { label: 'PURSUE', count: recommendation.PURSUE },
    { label: 'REVIEW', count: recommendation.REVIEW },
    { label: 'SKIP', count: recommendation.SKIP },
    { label: 'Not Analyzed', count: recommendation['Not Analyzed'] },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeading
        title="Portfolio Reports"
        description="Understand opportunity performance, pipeline movement and readiness across your portfolio."
        action={<Button variant="outline" onClick={() => setPreviewOpen(true)}><FileText className="h-4 w-4" /> Preview / Export Report</Button>}
      />

      {/* Executive summary */}
      <Section title="Executive Summary">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total Opportunities" value={pipeline.total} />
          <Metric label="Active" value={pipeline.active} sub={`${pipeline.Skipped.count} skipped`} />
          <Metric label="Pursuing" value={pipeline.Pursuing.count} />
          <Metric label="Reviewing" value={pipeline.Reviewing.count} />
          <Metric label="Average Match Score" value={qual.analyzed ? `${qual.averageMatch}%` : '—'} />
          <Metric label="Avg Proposal Readiness" value={proposal.total ? `${proposal.averageReadiness}%` : '—'} />
          <Metric label="Avg Compliance Readiness" value={compliance.reviewed ? `${compliance.averageReadiness}%` : '—'} />
          <Metric label="Need Attention" value={attention.length} />
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pipeline */}
        <Section title="Pipeline">
          <Card><CardContent className="p-5">
            <BarList
              total={pipeline.total}
              data={[
                { label: 'New', count: pipeline.New.count },
                { label: 'Reviewing', count: pipeline.Reviewing.count },
                { label: 'Pursuing', count: pipeline.Pursuing.count },
                { label: 'Skipped', count: pipeline.Skipped.count },
              ]}
            />
          </CardContent></Card>
        </Section>

        {/* Qualification */}
        <Section title="Qualification">
          <Card><CardContent className="p-5">
            {qual.analyzed === 0 ? (
              <p className="text-sm text-gov-muted">No qualification data available.</p>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <Metric label="Analyzed" value={qual.analyzed} />
                  <Metric label="Not Analyzed" value={qual.notAnalyzed} />
                  <Metric label="Avg Match" value={`${qual.averageMatch}%`} />
                </div>
                <BarList data={match.buckets} total={match.total} colorClass="bg-gov-green" />
              </>
            )}
          </CardContent></Card>
        </Section>

        {/* Proposal */}
        <Section title="Proposal">
          <Card><CardContent className="p-5">
            {proposal.total === 0 ? (
              <p className="text-sm text-gov-muted">No proposals created yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Total" value={proposal.total} />
                <Metric label="Draft" value={proposal.draft} />
                <Metric label="In Review" value={proposal.inReview} />
                <Metric label="Ready" value={proposal.ready} />
                <Metric label="Avg Readiness" value={`${proposal.averageReadiness}%`} />
              </div>
            )}
          </CardContent></Card>
        </Section>

        {/* Compliance */}
        <Section title="Compliance">
          <Card><CardContent className="p-5">
            {compliance.reviewed === 0 ? (
              <p className="text-sm text-gov-muted">No compliance reviews completed yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Reviewed" value={compliance.reviewed} />
                <Metric label="Ready" value={compliance.ready} />
                <Metric label="Needs Attention" value={compliance.needsAttention} />
                <Metric label="Not Ready" value={compliance.notReady} />
                <Metric label="Avg Readiness" value={`${compliance.averageReadiness}%`} />
              </div>
            )}
          </CardContent></Card>
        </Section>

        {/* Sector distribution */}
        <Section title="Opportunities by Sector">
          <Card><CardContent className="p-5"><BarList data={sectors.map((s) => ({ label: s.sector, count: s.count }))} total={pipeline.total} colorClass="bg-navy-900" /></CardContent></Card>
        </Section>

        {/* Recommendation distribution */}
        <Section title="Recommendation Distribution">
          <Card><CardContent className="p-5"><BarList data={recData} total={pipeline.total} colorClass="bg-saffron-500" /></CardContent></Card>
        </Section>
      </div>

      {/* Deadline */}
      <Section title="Deadline Overview">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Due Soon (≤7 days)" value={deadline.dueSoon} />
          <Metric label="Upcoming" value={deadline.upcoming} />
          <Metric label="Past" value={deadline.past} />
        </div>
      </Section>

      {/* Priority + attention */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Priority for Review">
          <PriorityOpportunities rows={priority} />
        </Section>
        <Section title="Attention Areas">
          <AttentionPanel items={attention} />
        </Section>
      </div>

      {previewOpen && <ReportPreview report={report} profile={profile} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
