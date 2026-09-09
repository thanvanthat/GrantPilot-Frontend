import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, ListChecks, FileText, ShieldCheck, PenLine,
  ShieldAlert, Clock, RefreshCw, Info,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getOpportunity } from '@/data/opportunities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StatusPill } from '@/components/common/StatusPill';
import { EmptyState } from '@/components/common/EmptyState';
import { OpportunityHeader } from '@/components/opportunities/OpportunityHeader';
import { OpportunityStatusControl } from '@/components/opportunities/OpportunityStatusControl';
import { MatchScorePanel } from '@/components/opportunities/MatchScore';
import { MatchBreakdown } from '@/components/opportunities/MatchBreakdown';
import { EligibilityPanel } from '@/components/opportunities/EligibilityPanel';
import { CapabilityMatch } from '@/components/opportunities/CapabilityMatch';
import { RequirementAnalysis } from '@/components/opportunities/RequirementAnalysis';
import { GapAnalysis } from '@/components/opportunities/GapAnalysis';
import { RiskPanel } from '@/components/opportunities/RiskPanel';
import { EvidencePanel } from '@/components/opportunities/EvidencePanel';
import { RecommendationPanel } from '@/components/opportunities/RecommendationPanel';
import { NextActions } from '@/components/opportunities/NextActions';
import { QualificationProgress, QUALIFICATION_STEPS } from '@/components/opportunities/QualificationProgress';
import { analyzeOpportunity } from '@/services/snsWorkbench';
import { readinessLabel } from '@/utils/complianceEngine';
import { InsightBox } from '@/components/common/InsightBox';

/** Lightweight titled section wrapper used down the workspace. */
function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="heading-underline mb-4 text-lg font-bold tracking-tight text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  return new Date(iso).toLocaleString('en-IN');
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const opportunity = getOpportunity(id);
  const {
    profile, documents, qualifications, saveMatchResult,
    ensureProposal, selectOpportunity,
    getOpportunityStatus, markOpportunityStatus, complianceResults,
  } = useApp();

  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const stepTimer = useRef(null);
  const result = qualifications[id];
  const compliance = complianceResults[id];
  const status = getOpportunityStatus(id);

  useEffect(() => () => clearInterval(stepTimer.current), []);

  if (!opportunity) {
    return (
      <div className="animate-fade-in">
        <SectionHeading title="Opportunity not found" description="This opportunity does not exist." />
        <Button variant="outline" onClick={() => navigate('/opportunities')}>
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Button>
      </div>
    );
  }

  async function runQualification() {
    setAnalyzing(true);
    setStep(0);
    // Advance the staged progress indicator while the mock workflow runs.
    stepTimer.current = setInterval(
      () => setStep((s) => Math.min(s + 1, QUALIFICATION_STEPS.length - 1)),
      320,
    );
    // React Page -> Service -> snsWorkbench (mock now, SNS Workbench later)
    const res = await analyzeOpportunity(profile, documents, opportunity);
    clearInterval(stepTimer.current);
    saveMatchResult(opportunity.id, res);
    if (getOpportunityStatus(opportunity.id) === 'New') markOpportunityStatus(opportunity.id, 'Reviewing');
    setAnalyzing(false);
  }

  function generateProposal() {
    ensureProposal(opportunity.id);
    navigate(`/proposals/${opportunity.id}`);
  }

  function checkCompliance() {
    ensureProposal(opportunity.id);
    selectOpportunity(opportunity.id);
    navigate('/compliance');
  }

  return (
    <div className="animate-fade-in">
      <Link to="/opportunities" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to opportunities
      </Link>

      {/* 1. Overview header */}
      <div className="mb-6">
        <OpportunityHeader opportunity={opportunity} status={status} />
      </div>

      {/* Human-in-the-loop note */}
      <div className="mb-6 flex items-start gap-2 rounded-gov border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong className="font-semibold">GrantPilot provides AI-assisted qualification support.</strong>{' '}
          Qualification is decision support — final eligibility, technical, legal and financial decisions must be
          validated by the responsible team.
        </span>
      </div>

      {/* Status control */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="text-sm font-semibold text-navy-900">Opportunity status</span>
          <OpportunityStatusControl value={status} onChange={(s) => markOpportunityStatus(opportunity.id, s)} />
        </CardContent>
      </Card>

      {/* Overview text */}
      <Section title="Opportunity Overview">
        <Card><CardContent className="p-6"><p className="text-sm leading-relaxed text-gov-ink">{opportunity.description}</p></CardContent></Card>
      </Section>

      {/* Qualification workspace: before / loading / complete */}
      {!result && !analyzing && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <EmptyState
              icon={ShieldAlert}
              title="Qualification not run"
              description="Run qualification to compare this opportunity against your company profile, capabilities and available documents."
              action={<Button onClick={runQualification}><Sparkles className="h-4 w-4" /> Run Qualification</Button>}
            />
          </CardContent>
        </Card>
      )}

      {analyzing && (
        <Card className="mb-6"><CardContent className="p-6"><QualificationProgress active={step} /></CardContent></Card>
      )}

      {result && !analyzing && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gov-green">
              <ShieldCheck className="h-4 w-4" /> Qualification complete
              <span className="inline-flex items-center gap-1 font-normal text-gov-muted"><Clock className="h-3.5 w-3.5" /> Analyzed {relativeTime(result.analyzedAt)}</span>
            </p>
            <Button variant="outlineSaffron" onClick={runQualification}>
              <RefreshCw className="h-4 w-4" /> Re-run Qualification
            </Button>
          </div>

          {/* 2. Match score + 3. breakdown */}
          <Section title="Match Score">
            <Card><CardContent className="p-6"><MatchScorePanel score={result.overallScore} matchClass={result.matchClass} /></CardContent></Card>
            <div className="mt-4"><MatchBreakdown breakdown={result.scoreBreakdown} /></div>
          </Section>

          {/* 4. Eligibility */}
          <Section title="Eligibility"><EligibilityPanel items={result.eligibilityItems} overall={result.eligibilityStatus} /></Section>

          {/* 5. Capability match */}
          <Section title="Capability Match"><CapabilityMatch capabilityMatch={result.capabilityMatch} /></Section>

          {/* 6. Requirement analysis */}
          <Section title="Requirement Analysis"><RequirementAnalysis requirements={result.requirements} /></Section>

          {/* 7. Gap analysis */}
          <Section title="Gap Analysis"><GapAnalysis gaps={result.gaps} /></Section>

          {/* 8. Risk analysis */}
          <Section title="Risk Analysis"><RiskPanel risks={result.risks} /></Section>

          {/* 9. Evidence / reasoning */}
          <Section title="Evidence & Reasoning">
            <Card><CardContent className="p-6"><EvidencePanel evidence={result.evidence} matchClass={result.matchClass} /></CardContent></Card>
          </Section>

          {/* 10. Recommendation + next actions */}
          <Section title="Recommendation">
            <RecommendationPanel result={result} />
            <div className="mt-4">
              <InsightBox>
                Based on the information currently available, {profile.companyName || 'your company'} shows{' '}
                <strong>{result.matchClass?.toLowerCase()} alignment</strong> with this opportunity.{' '}
                {result.gaps.filter((g) => g.severity === 'High').length > 0
                  ? 'Address the high-severity gaps and confirm the missing evidence before proposal preparation.'
                  : 'No high-severity gaps were found; proceed with a final human review before submission.'}
              </InsightBox>
            </div>
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-bold text-navy-900">Next Actions</h3>
              <NextActions actions={result.nextActions} />
            </div>
          </Section>

          {/* Compliance summary card */}
          <Section title="Compliance">
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                {compliance ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">Compliance Readiness</p>
                    <p className="text-2xl font-extrabold text-navy-900">{compliance.readinessScore}%</p>
                    <p className="text-sm font-medium text-gov-ink">{readinessLabel(compliance.readinessStatus)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gov-muted">Compliance check not run for this opportunity yet.</p>
                )}
                <Button variant="outline" onClick={() => navigate(`/compliance?opportunity=${opportunity.id}`)}>
                  <ShieldCheck className="h-4 w-4" /> Open Compliance Workspace
                </Button>
              </CardContent>
            </Card>
          </Section>
        </>
      )}

      {/* Requirements + documents reference */}
      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-900">
              <ListChecks className="h-4 w-4 text-saffron-600" /> Technical Requirements
            </h3>
            <ul className="space-y-2">
              {opportunity.technicalRequirements.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-gov-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-500" />{r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-900">
              <FileText className="h-4 w-4 text-saffron-600" /> Documents Required
            </h3>
            <ul className="space-y-2">
              {opportunity.documentsRequired.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-gov-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-900" />{d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Next actions / navigation */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={generateProposal}><PenLine className="h-4 w-4" /> Start Proposal</Button>
        <Button variant="outline" onClick={checkCompliance}><ShieldCheck className="h-4 w-4" /> Check Compliance</Button>
      </div>

      {/* Requirement evidence table (raw match details reference) */}
      {result && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-bold text-navy-900">Requirement Evidence (source data)</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gov-border bg-gov-bg text-xs uppercase tracking-wide text-gov-muted">
                      <th className="px-5 py-3 font-semibold">Requirement</th>
                      <th className="px-5 py-3 font-semibold">Evidence</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gov-border">
                    {opportunity.matchDetails.map((m) => (
                      <tr key={m.requirement}>
                        <td className="px-5 py-3 font-medium text-navy-900">{m.requirement}</td>
                        <td className="px-5 py-3 text-gov-muted">{m.evidence}</td>
                        <td className="px-5 py-3"><StatusPill status={m.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
