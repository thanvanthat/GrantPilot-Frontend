import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Loader2, RefreshCw, FileText, ShieldCheck, Clock, Info, Search, Target,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';
import { ComplianceSummary } from '@/components/compliance/ComplianceSummary';
import { ReadinessGate } from '@/components/compliance/ReadinessGate';
import { ComplianceBlockers } from '@/components/compliance/ComplianceBlockers';
import { RequirementChecklist } from '@/components/compliance/RequirementChecklist';
import { RequirementDetail } from '@/components/compliance/RequirementDetail';
import { DocumentVerification } from '@/components/compliance/DocumentVerification';
import { RiskRegister } from '@/components/compliance/RiskRegister';
import { NextActions } from '@/components/compliance/NextActions';
import { CompliancePreview } from '@/components/compliance/CompliancePreview';
import { ComplianceProgress, COMPLIANCE_STEPS } from '@/components/compliance/ComplianceProgress';

const STATUS_FILTERS = ['All', 'ADDRESSED', 'PARTIAL', 'MISSING', 'NEEDS_REVIEW'];

function Section({ title, description, children }) {
  return (
    <section className="mb-6">
      <h2 className="heading-underline mb-1 text-lg font-bold tracking-tight text-navy-900">{title}</h2>
      {description ? <p className="mb-4 mt-3 text-sm text-gov-muted">{description}</p> : <div className="mb-4" />}
      {children}
    </section>
  );
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  return new Date(iso).toLocaleString('en-IN');
}

export default function Compliance() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    profile, matches, qualifications, proposals, complianceResults,
    activeOpportunityId, setActiveOpportunityId,
    runComplianceCheck, setReviewerState, setReviewerNote, setRiskStatus,
  } = useApp();

  const urlOpp = searchParams.get('opportunity');
  const selectedId = urlOpp || activeOpportunityId || Object.keys(complianceResults)[0] || Object.keys(qualifications)[0] || null;

  useEffect(() => {
    if (urlOpp && urlOpp !== activeOpportunityId) setActiveOpportunityId(urlOpp);
  }, [urlOpp, activeOpportunityId, setActiveOpportunityId]);

  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const stepTimer = useRef(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => () => clearInterval(stepTimer.current), []);

  const opportunity = matches.find((o) => o.id === selectedId);
  const qualification = selectedId ? qualifications[selectedId] : null;
  const result = selectedId ? complianceResults[selectedId] : null;

  const categories = useMemo(
    () => ['All', ...Array.from(new Set((result?.items || []).map((i) => i.category)))],
    [result],
  );

  const filteredItems = useMemo(() => {
    if (!result) return [];
    const q = query.trim().toLowerCase();
    return result.items
      .filter((i) => (statusFilter === 'All' ? true : i.status === statusFilter))
      .filter((i) => (categoryFilter === 'All' ? true : i.category === categoryFilter))
      .filter((i) => !q || `${i.requirement} ${i.category} ${i.evidence} ${i.remarks}`.toLowerCase().includes(q));
  }, [result, statusFilter, categoryFilter, query]);

  const selectedItem = result && selectedItemId ? result.items.find((i) => i.id === selectedItemId) : null;

  function selectOpportunityId(idValue) {
    setActiveOpportunityId(idValue);
    setSearchParams(idValue ? { opportunity: idValue } : {});
  }

  function runCheck() {
    setRunning(true);
    setStep(0);
    stepTimer.current = setInterval(() => setStep((s) => Math.min(s + 1, COMPLIANCE_STEPS.length - 1)), 320);
    setTimeout(() => {
      clearInterval(stepTimer.current);
      runComplianceCheck(selectedId);
      setRunning(false);
    }, 1700);
  }

  // Opportunity picker used across states.
  const picker = (
    <Select value={selectedId || ''} onChange={(e) => selectOpportunityId(e.target.value)} className="h-9 w-auto min-w-[18rem]" aria-label="Select opportunity">
      <option value="">Select an opportunity…</option>
      {matches.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
    </Select>
  );

  // ---- Empty / guard states ----
  if (!selectedId || !opportunity) {
    return (
      <div className="animate-fade-in">
        <SectionHeading title="Compliance Workspace" description="Verify requirements, evidence, documents and risks before internal review." />
        <div className="mb-4">{picker}</div>
        <EmptyState
          icon={Target}
          title="Select an opportunity to begin compliance review"
          description="Compliance consumes the qualification result, proposal and documents for the chosen opportunity."
          action={<Button onClick={() => navigate('/opportunities')}>View Opportunities</Button>}
        />
      </div>
    );
  }

  if (!qualification) {
    return (
      <div className="animate-fade-in">
        <SectionHeading title="Compliance Workspace" description={`${opportunity.title} · ${opportunity.organization}`} />
        <div className="mb-4">{picker}</div>
        <EmptyState
          icon={Sparkles}
          title="Run qualification before starting compliance review"
          description="Compliance builds on the qualification analysis. Qualify this opportunity first."
          action={<Button onClick={() => navigate(`/opportunities/${selectedId}`)}>Open qualification</Button>}
        />
      </div>
    );
  }

  const hasProposal = Boolean(proposals[selectedId]);

  return (
    <div className="animate-fade-in">
      <SectionHeading
        title="Compliance Workspace"
        description={`${opportunity.title} · ${opportunity.organization}`}
        action={picker}
      />

      {/* Responsible-AI note */}
      <div className="mb-6 flex items-start gap-2 rounded-gov border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong className="font-semibold">GrantPilot provides AI-assisted compliance readiness analysis</strong> based on the
          information available in the workspace. Responsible team members must verify requirements, evidence and final
          submission details. This is not an official government compliance determination.
        </span>
      </div>

      {!hasProposal && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-gov border border-gov-amber/30 bg-gov-amberLight px-4 py-3 text-sm text-gov-amber">
          <span>No proposal exists for this opportunity yet — proposal coverage will read 0%.</span>
          <Button variant="subtle" size="sm" onClick={() => navigate(`/proposals/${selectedId}`)}>Create proposal</Button>
        </div>
      )}

      {/* Not run / running / results */}
      {!result && !running && (
        <Card><CardContent className="p-6">
          <EmptyState
            icon={ShieldCheck}
            title="Compliance check not run"
            description="Run a compliance check to compare opportunity requirements, qualification findings, proposal coverage and available documents."
            action={<Button onClick={runCheck}><Sparkles className="h-4 w-4" /> Run Compliance Check</Button>}
          />
        </CardContent></Card>
      )}

      {running && (
        <Card><CardContent className="p-6"><ComplianceProgress active={step} /></CardContent></Card>
      )}

      {result && !running && (
        <>
          {/* Actions row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-1.5 text-sm text-gov-muted">
              <Clock className="h-3.5 w-3.5" /> Checked {relativeTime(result.lastUpdated)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outlineSaffron" onClick={runCheck}><RefreshCw className="h-4 w-4" /> Re-run Compliance Check</Button>
              <Button variant="outline" onClick={() => setPreviewOpen(true)}><FileText className="h-4 w-4" /> Preview / Export Report</Button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mb-8"><ComplianceSummary result={result} /></div>

          {/* Readiness gate + blockers */}
          <Section title="Readiness Gate" description="Whether this opportunity is ready for internal review, and what stands in the way.">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <ReadinessGate result={result} />
              <div>
                <h3 className="mb-2 text-sm font-bold text-navy-900">Blockers ({result.blockers.length})</h3>
                <ComplianceBlockers blockers={result.blockers} />
              </div>
            </div>
          </Section>

          {/* Requirement checklist */}
          <Section title="Requirement Checklist" description="Each requirement, its evidence and internal review state. Click a requirement for detail.">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[14rem] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requirement, category or evidence" className="pl-9" />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[11rem]" aria-label="Filter by status">
                {STATUS_FILTERS.map((s) => <option key={s} value={s}>Status: {s === 'NEEDS_REVIEW' ? 'Needs Review' : s}</option>)}
              </Select>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-auto min-w-[11rem]" aria-label="Filter by category">
                {categories.map((c) => <option key={c} value={c}>Category: {c}</option>)}
              </Select>
            </div>
            <RequirementChecklist items={filteredItems} onSelect={(it) => setSelectedItemId(it.id)} />
          </Section>

          {/* Document verification */}
          <Section title="Document Verification" description="Required documents compared against uploaded documents in your library.">
            <DocumentVerification documents={result.documents} />
          </Section>

          {/* Risk register */}
          <Section title="Risk Register" description="Requirement-linked compliance risks. Update status as your team works them.">
            <RiskRegister risks={result.risks} onStatusChange={(riskId, status) => setRiskStatus(selectedId, riskId, status)} />
          </Section>

          {/* Next actions */}
          <Section title="Next Actions">
            <NextActions result={result} />
          </Section>
        </>
      )}

      {/* Requirement detail dialog */}
      {selectedItem && (
        <RequirementDetail
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
          onReviewerState={(itemId, state) => setReviewerState(selectedId, itemId, state)}
          onNote={(itemId, note) => setReviewerNote(selectedId, itemId, note)}
        />
      )}

      {/* Report preview / export */}
      {previewOpen && result && (
        <CompliancePreview result={result} profile={profile} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
