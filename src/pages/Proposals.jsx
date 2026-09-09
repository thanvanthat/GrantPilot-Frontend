import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles, Loader2, CheckCircle2, Save, RefreshCw, ShieldCheck, Circle, PenLine,
  Download, Wand2, Clock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea, Select } from '@/components/ui/input';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProposalReadiness } from '@/components/proposals/ProposalReadiness';
import { SectionGuidance } from '@/components/proposals/SectionGuidance';
import {
  PROPOSAL_SECTIONS, proposalReadiness, proposalBlockers,
  sectionGuidance, buildProposalExport, wordCount,
} from '@/data/proposalSections';
import { getOpportunity, OPPORTUNITIES } from '@/data/opportunities';
import { generateProposal as generateProposalSvc } from '@/services/snsWorkbench';
import { readinessLabel } from '@/utils/complianceEngine';
import { cn } from '@/lib/utils';

const PROPOSAL_STATUSES = ['Draft', 'In Review', 'Ready'];

/** Shown when no proposal has been started yet. */
function StartPanel() {
  const navigate = useNavigate();
  const { matches, ensureProposal } = useApp();
  const options = matches.length ? matches : OPPORTUNITIES;
  const [choice, setChoice] = useState(options[0]?.id ?? '');

  return (
    <div className="animate-fade-in">
      <SectionHeading title="Proposal Builder" description="Draft, regenerate and track completion of every proposal section." />
      <Card>
        <CardContent className="p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-gov bg-saffron-50 text-saffron-600">
            <PenLine className="h-6 w-6" />
          </span>
          <h3 className="text-base font-bold text-navy-900">Start a proposal</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gov-muted">
            Choose an opportunity and GrantPilot will draft every section from your company profile and its qualification analysis.
          </p>
          <div className="mx-auto mt-5 flex max-w-md flex-col gap-3 sm:flex-row">
            <Select value={choice} onChange={(e) => setChoice(e.target.value)}>
              {options.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
            </Select>
            <Button className="shrink-0" onClick={() => { ensureProposal(choice); navigate(`/proposals/${choice}`); }}>
              <Sparkles className="h-4 w-4" /> Generate Proposal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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

export default function Proposals() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    profile, proposals, qualifications, ensureProposal, updateProposalSection,
    updateProposalStatus, activeOpportunityId, setActiveOpportunityId, complianceResults,
  } = useApp();

  const targetId = id || activeOpportunityId || Object.keys(proposals)[0] || null;

  useEffect(() => {
    if (id) { ensureProposal(id); setActiveOpportunityId(id); }
  }, [id, ensureProposal, setActiveOpportunityId]);

  const draft = targetId ? proposals[targetId] : null;
  const qualification = targetId ? qualifications[targetId] : null;
  const compliance = targetId ? complianceResults[targetId] : null;

  const [activeSection, setActiveSection] = useState(PROPOSAL_SECTIONS[0].id);
  const [editorText, setEditorText] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (draft) setEditorText(draft.sections[activeSection]?.content ?? '');
  }, [draft, activeSection]);

  const readiness = useMemo(() => proposalReadiness(draft), [draft]);
  const blockers = useMemo(() => proposalBlockers(draft, qualification), [draft, qualification]);
  const guidance = useMemo(() => sectionGuidance(activeSection, qualification), [activeSection, qualification]);

  if (!targetId || !draft) return <StartPanel />;

  const opportunity = getOpportunity(targetId);
  const section = draft.sections[activeSection];
  const dirty = section && editorText !== section.content;
  const activeTitle = PROPOSAL_SECTIONS.find((s) => s.id === activeSection)?.title;

  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function save() {
    updateProposalSection(targetId, activeSection, { content: editorText });
    flashSaved();
  }

  function markComplete() {
    updateProposalSection(targetId, activeSection, { content: editorText, complete: !section.complete });
  }

  async function regenerate() {
    setRegenerating(true);
    // React Page -> Service -> snsWorkbench (mock now, SNS Workbench later)
    const fresh = await generateProposalSvc(profile, opportunity, activeSection, qualification);
    setEditorText(fresh);
    updateProposalSection(targetId, activeSection, { content: fresh });
    setRegenerating(false);
  }

  async function regenerateAll() {
    setRegeneratingAll(true);
    const freshDraft = await generateProposalSvc(profile, opportunity, null, qualification);
    PROPOSAL_SECTIONS.forEach((s) => {
      updateProposalSection(targetId, s.id, { content: freshDraft.sections[s.id].content });
    });
    setEditorText(freshDraft.sections[activeSection].content);
    setRegeneratingAll(false);
  }

  function exportProposal() {
    // TODO: Connect to SNS Workbench API - generate final proposal document
    const blob = new Blob([buildProposalExport(draft)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grantpilot-proposal-${targetId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-in">
      <SectionHeading
        title="Proposal Builder"
        description={`${draft.opportunityTitle} · ${draft.organization}`}
        action={
          <div className="flex items-center gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gov-muted">Status</p>
              <Select value={draft.status || 'Draft'} onChange={(e) => updateProposalStatus(targetId, e.target.value)} className="h-9 w-auto min-w-[9rem]">
                {PROPOSAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
        }
      />

      {/* Readiness + top actions */}
      <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <ProposalReadiness readiness={readiness} status={draft.status || 'Draft'} blockers={blockers} />
        <div className="flex flex-col gap-2 lg:w-56">
          <Button variant="outlineSaffron" onClick={regenerateAll} disabled={regeneratingAll} className="justify-start">
            {regeneratingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Regenerate all sections
          </Button>
          <Button onClick={() => { setActiveOpportunityId(targetId); navigate('/compliance'); }} className="justify-start">
            <ShieldCheck className="h-4 w-4" /> Run Compliance Check
          </Button>
          <Button variant="outline" onClick={exportProposal} className="justify-start">
            <Download className="h-4 w-4" /> Export Proposal
          </Button>
          {draft.updatedAt && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gov-muted"><Clock className="h-3 w-3" /> Updated {relativeTime(draft.updatedAt)}</p>
          )}
          {compliance && (
            <div className="mt-1 rounded-gov border border-gov-border bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gov-muted">Compliance</p>
              <p className="text-lg font-extrabold text-navy-900">{compliance.readinessScore}%</p>
              <p className="text-xs text-gov-muted">{readinessLabel(compliance.readinessStatus)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        {/* Section list */}
        <Card className="h-fit">
          <CardContent className="p-2">
            <ul>
              {PROPOSAL_SECTIONS.map((s) => {
                const done = draft.sections[s.id]?.complete;
                const active = s.id === activeSection;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(s.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-gov px-3 py-2.5 text-left text-sm transition-colors',
                        active ? 'bg-navy-50 font-semibold text-navy-900' : 'text-gov-ink hover:bg-gov-bg',
                      )}
                    >
                      {done
                        ? <CheckCircle2 className="h-4 w-4 shrink-0 text-gov-green" />
                        : <Circle className={cn('h-4 w-4 shrink-0', active ? 'text-saffron-500' : 'text-slate-300')} />}
                      <span className="flex-1">{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Editor + guidance */}
        <div className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-navy-900">{activeTitle}</h2>
                  <span className="text-xs text-gov-muted">{wordCount(editorText)} words</span>
                </div>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  section.complete ? 'bg-gov-greenLight text-gov-green' : 'bg-gov-amberLight text-gov-amber',
                )}>
                  {section.complete ? 'Complete' : 'Draft'}
                </span>
              </div>

              <Textarea
                rows={16}
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="font-mono text-[13px] leading-relaxed"
                aria-label={`${activeTitle} content`}
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="outlineSaffron" onClick={regenerate} disabled={regenerating || regeneratingAll}>
                  {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Regenerate with AI
                </Button>
                <Button variant={section.complete ? 'subtle' : 'navy'} onClick={markComplete}>
                  <CheckCircle2 className="h-4 w-4" />
                  {section.complete ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                <Button variant="subtle" onClick={save} disabled={!dirty}>
                  <Save className="h-4 w-4" /> Save
                </Button>
                {savedFlash && <span className="text-xs font-medium text-gov-green">Saved</span>}
                {dirty && !savedFlash && <span className="text-xs font-medium text-gov-amber">Unsaved changes</span>}
              </div>
            </CardContent>
          </Card>

          <SectionGuidance
            guidance={guidance}
            onRunQualification={() => navigate(`/opportunities/${targetId}`)}
          />
        </div>
      </div>
    </div>
  );
}
