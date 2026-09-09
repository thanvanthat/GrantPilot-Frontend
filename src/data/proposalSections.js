// Proposal section definitions, the mock "AI" content generator, and the
// qualification-aware guidance that ties the proposal stage back to the
// analysis produced on the opportunity detail page (via opportunityId).
//
// generateSectionContent() stands in for the SNS Workbench proposal-generation
// workflow. When a QualificationResult is passed, the draft weaves in the
// matched capabilities and the gaps the section should address, so the
// proposal reflects the analysis rather than generic boilerplate.

export const PROPOSAL_SECTIONS = [
  { id: 'executive-summary', title: 'Executive Summary' },
  { id: 'technical-approach', title: 'Technical Approach' },
  { id: 'innovation-statement', title: 'Innovation Statement' },
  { id: 'implementation-plan', title: 'Implementation Plan' },
  { id: 'team-capabilities', title: 'Team Capabilities' },
  { id: 'budget-justification', title: 'Budget Justification' },
  { id: 'expected-impact', title: 'Expected Impact' },
  { id: 'milestones-timeline', title: 'Milestones & Timeline' },
];

// Which qualification signals each section should draw on.
const SECTION_HINTS = {
  'executive-summary': { citeCaps: true, gapCategories: ['Capability', 'Certification'], note: 'Lead with the recommendation and your strongest fit points; acknowledge any material gap briefly.' },
  'technical-approach': { citeCaps: true, gapCategories: ['Capability'], note: 'Show how each requirement is met, and explain how capability gaps will be mitigated.' },
  'innovation-statement': { citeCaps: true, gapCategories: [], note: 'Emphasise the differentiators behind your matched capabilities.' },
  'implementation-plan': { citeCaps: false, gapCategories: ['Documentation'], note: 'Build document preparation and evidence collection into the plan.' },
  'team-capabilities': { citeCaps: true, gapCategories: ['Experience'], note: 'Cite matched capabilities and address experience gaps honestly.' },
  'budget-justification': { citeCaps: false, gapCategories: [], note: 'Tie each cost line to a deliverable in the implementation plan.' },
  'expected-impact': { citeCaps: false, gapCategories: [], note: "Connect outcomes to the department's sector objective." },
  'milestones-timeline': { citeCaps: false, gapCategories: ['Certification'], note: 'Add certification and clearance milestones where required.' },
};

function list(items = []) {
  return items.map((i) => `- ${i}`).join('\n');
}

/** Guidance for the active section, derived from the qualification result. */
export function sectionGuidance(sectionId, qualification) {
  const hint = SECTION_HINTS[sectionId] || { citeCaps: false, gapCategories: [], note: '' };
  if (!qualification) {
    return { cite: [], address: [], note: hint.note, hasQualification: false };
  }
  const cite = hint.citeCaps
    ? [...(qualification.capabilityMatch?.matched || []), ...(qualification.capabilityMatch?.partial || [])]
    : [];
  const address = (qualification.gaps || []).filter((g) => hint.gapCategories.includes(g.category));
  return { cite, address, note: hint.note, hasQualification: true };
}

export function generateSectionContent(sectionId, profile, opportunity, qualification = null) {
  const p = profile || {};
  const o = opportunity || {};
  const tech = (p.technologies || []).join(', ');
  const certs = (p.certifications || []).join(', ');

  const g = sectionGuidance(sectionId, qualification);
  const matched = g.cite.join(', ');
  const gapText = g.address.length
    ? g.address.map((x) => `- ${x.description}: ${x.suggestedAction}`).join('\n')
    : '';

  switch (sectionId) {
    case 'executive-summary':
      return `${p.companyName} submits this proposal in response to "${o.title}" issued by ${o.organization}. As a ${p.sector} focused company based in ${p.location} with ${p.experienceYears} years of operations, we are well positioned to deliver against the stated objective within the ${o.budget} envelope.

Our core capability in ${tech || 'the required technologies'} directly addresses the requirements of this ${String(o.type || '').toLowerCase()}.${qualification ? ` Our internal qualification assessed this opportunity at ${qualification.overallScore}% fit (${qualification.matchClass} match).` : ''} This document sets out our technical approach, implementation plan, team, budget and expected impact.`;

    case 'technical-approach':
      return `Our solution is engineered to meet the technical requirements of this opportunity:

${list(o.technicalRequirements)}

We build on our existing platform capabilities in ${tech || 'the relevant domains'}, extending them to satisfy each requirement above.${matched ? ` The following capabilities are directly relevant: ${matched}.` : ''} The architecture prioritises reliability, security and maintainability, and is validated against the acceptance criteria described in the tender.${gapText ? `\n\nMitigation of identified gaps:\n${gapText}` : ''}`;

    case 'innovation-statement':
      return `The proposed solution advances the state of practice in ${p.sector}. ${p.capabilities || 'Our engineering capabilities'} allow us to deliver measurable improvements over conventional approaches.${matched ? ` Our differentiators build on ${matched}.` : ''}

Key innovations include the application of ${tech || 'advanced techniques'} to the specific operating conditions described by ${o.organization}, reducing manual effort and improving decision quality.`;

    case 'implementation-plan':
      return `Implementation is delivered in three phases across the ${o.deadline}-day evaluation and subsequent delivery window:

- Phase 1 - Requirements finalisation, environment setup and interface design.
- Phase 2 - Core build, integration and internal validation against the technical requirements.
- Phase 3 - Field trials, acceptance testing and handover with documentation and training.

Each phase concludes with a formal review gate and evidence pack.${gapText ? `\n\nDocumentation to prepare during delivery:\n${gapText}` : ''}`;

    case 'team-capabilities':
      return `${p.companyName} fields a team of ${p.teamSize} professionals. Our relevant track record includes:

${p.previousGovProjects || 'Prior delivery experience across comparable engagements.'}

The team holds the following certifications relevant to this opportunity: ${certs || 'as detailed in the company profile'}.${matched ? ` Matched capabilities for this engagement: ${matched}.` : ''} Products in production today include:

${p.products || 'our current product portfolio'}${gapText ? `\n\nExperience gaps and how they are covered:\n${gapText}` : ''}`;

    case 'budget-justification':
      return `The total proposed cost is aligned to the ${o.budget} budget indicated for this opportunity. The allocation is as follows:

- Personnel and engineering effort - the largest share, reflecting the build and integration work.
- Hardware, licences and cloud infrastructure required for deployment.
- Field trials, testing, certification and project management.

Each line item is traceable to a deliverable in the implementation plan and represents fair market value.`;

    case 'expected-impact':
      return `Successful delivery will provide ${o.organization} with a deployable, evidence-backed capability that meets the objectives of "${o.title}".

Expected outcomes include improved operational effectiveness, reduced manual overhead and a solution validated on Indian operating conditions. The engagement also strengthens the domestic ${p.sector} ecosystem.`;

    case 'milestones-timeline':
      return `Indicative milestones for the ${o.deadline}-day timeline:

- Day 0 - Contract award and kick-off.
- Day 15 - Requirements sign-off and design baseline.
- Day 40 - Core build complete, internal validation passed.
- Day 60 - Field trial and acceptance testing.
- Day 75 - Final handover, documentation and training.

Milestone payments are tied to acceptance at each gate.${gapText ? `\n\nCompliance milestones:\n${gapText}` : ''}`;

    default:
      return '';
  }
}

/** Builds a fresh proposal draft with every section pre-filled by mock AI. */
export function createProposalDraft(opportunity, profile, qualification = null) {
  const sections = {};
  for (const section of PROPOSAL_SECTIONS) {
    sections[section.id] = {
      content: generateSectionContent(section.id, profile, opportunity, qualification),
      complete: false,
    };
  }
  return {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    organization: opportunity.organization,
    status: 'Draft',
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Readiness = share of sections marked complete. */
export function proposalReadiness(draft) {
  if (!draft) return 0;
  const values = Object.values(draft.sections || {});
  if (!values.length) return 0;
  const done = values.filter((s) => s.complete).length;
  return Math.round((done / values.length) * 100);
}

/** Word count for a section's content. */
export function wordCount(text = '') {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Submission blockers beyond raw completion — surfaced in the readiness panel.
 * Ties the proposal back to the qualification (unaddressed high-severity gaps)
 * and to the section completion state.
 */
export function proposalBlockers(draft, qualification) {
  const blockers = [];
  const sections = draft?.sections || {};

  const incomplete = PROPOSAL_SECTIONS.filter((s) => !sections[s.id]?.complete);
  incomplete.forEach((s) =>
    blockers.push({ type: 'section', severity: 'Medium', label: `${s.title} not marked complete` }));

  const emptyish = PROPOSAL_SECTIONS.filter((s) => wordCount(sections[s.id]?.content) < 30);
  emptyish.forEach((s) =>
    blockers.push({ type: 'thin', severity: 'Low', label: `${s.title} is very short (under 30 words)` }));

  if (qualification) {
    (qualification.gaps || []).filter((g) => g.severity === 'High').forEach((g) =>
      blockers.push({ type: 'gap', severity: 'High', label: `Unresolved gap: ${g.description}` }));
    if (qualification.eligibilityStatus === 'FAIL') {
      blockers.push({ type: 'eligibility', severity: 'High', label: 'Eligibility currently assessed as FAIL' });
    }
  }
  return blockers;
}

/** Plain-text export of the whole proposal for download. */
export function buildProposalExport(draft) {
  const lines = [
    `GRANTPILOT PROPOSAL DRAFT`,
    `Opportunity: ${draft.opportunityTitle}`,
    `Organisation: ${draft.organization}`,
    `Status: ${draft.status}`,
    `Readiness: ${proposalReadiness(draft)}%`,
    `Generated: ${new Date(draft.createdAt).toLocaleString('en-IN')}`,
    ``,
    `This is an AI-assisted draft. Content must be reviewed and validated by the responsible team before submission.`,
    ``,
  ];
  PROPOSAL_SECTIONS.forEach((s, i) => {
    const section = draft.sections[s.id] || {};
    lines.push(`${i + 1}. ${s.title.toUpperCase()}  [${section.complete ? 'COMPLETE' : 'DRAFT'}]`);
    lines.push('');
    lines.push(section.content || '(empty)');
    lines.push('');
    lines.push('---');
    lines.push('');
  });
  return lines.join('\n');
}
