// ---------------------------------------------------------------------------
// GrantPilot compliance engine (deterministic mock, decision-support only).
//
// Compliance CONSUMES the outputs of the qualification engine and the proposal
// builder — it does not recompute qualification. Given the opportunity, its
// qualification result, the proposal draft, the uploaded documents and any
// reviewer overrides, it produces a ComplianceResult the workspace renders.
//
//   Qualification Result + Proposal + Documents -> Compliance Engine -> Result
//
// All business logic lives here; components only render what this returns.
// ---------------------------------------------------------------------------

import { proposalReadiness } from '@/data/proposalSections';

// Internal-review readiness thresholds and the minimum proposal readiness gate.
export const READINESS_BANDS = [
  { min: 90, status: 'READY', label: 'Ready for Internal Review' },
  { min: 75, status: 'MINOR_REVIEW', label: 'Minor Review Required' },
  { min: 50, status: 'NEEDS_ATTENTION', label: 'Needs Attention' },
  { min: 0, status: 'NOT_READY', label: 'Not Ready' },
];
export const MIN_PROPOSAL_READINESS = 60;

const STATUS_WEIGHT = { ADDRESSED: 100, PARTIAL: 60, NEEDS_REVIEW: 40, MISSING: 0 };
const PRIORITY_WEIGHT = { CRITICAL: 3, HIGH: 2, MEDIUM: 1.5, LOW: 1 };
const STATUS_TIER = ['NOT_READY', 'NEEDS_ATTENTION', 'MINOR_REVIEW', 'READY']; // low -> high

// Map a qualification requirement category to a compliance priority.
const CATEGORY_PRIORITY = {
  Eligibility: 'CRITICAL',
  Certification: 'HIGH',
  Technical: 'HIGH',
  Capability: 'HIGH',
  Experience: 'MEDIUM',
  Financial: 'MEDIUM',
  Documentation: 'MEDIUM',
  Submission: 'LOW',
};

// Map a qualification requirement status to a compliance status.
const QUAL_STATUS_MAP = { Matched: 'ADDRESSED', Partial: 'PARTIAL', Missing: 'MISSING', Review: 'NEEDS_REVIEW' };

const slug = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
const norm = (s = '') => s.trim().toLowerCase();

export function readinessLabel(status) {
  return READINESS_BANDS.find((b) => b.status === status)?.label ?? status;
}

// --- requirement items ----------------------------------------------------

/** Find an uploaded document that supports a required-document string. */
function matchDocument(req, documents = []) {
  return documents.find((d) => {
    const t = norm(d.type);
    return norm(req).includes(t) || t.split(' ').some((w) => w.length > 3 && norm(req).includes(w));
  }) || null;
}

const DOC_TO_ITEM_STATUS = { AVAILABLE: 'ADDRESSED', NEEDS_REVIEW: 'NEEDS_REVIEW', MISSING: 'MISSING' };

/**
 * Transform qualification requirements into compliance items. Documentation
 * items are re-evaluated against LIVE documents so uploading a document is
 * reflected on the next compliance run (the rest is consumed from qualification).
 */
export function buildComplianceItems(qualification, documents = [], reviews = {}) {
  const itemReviews = reviews.items || {};
  return (qualification.requirements || []).map((r, i) => {
    const id = `${slug(r.category)}-${slug(r.requirement)}-${i}`;
    let status = QUAL_STATUS_MAP[r.status] || 'NEEDS_REVIEW';
    let evidence = r.evidence || 'Not available';
    let evidenceSource = 'Company profile / qualification';

    if (r.category === 'Documentation') {
      const match = matchDocument(r.requirement, documents);
      const docStatus = match ? (match.status === 'Processed' ? 'AVAILABLE' : 'NEEDS_REVIEW') : 'MISSING';
      status = DOC_TO_ITEM_STATUS[docStatus];
      evidence = match ? match.name : 'Not uploaded';
      evidenceSource = 'Uploaded documents';
    }

    const override = itemReviews[id] || {};
    return {
      id,
      requirementId: id,
      requirement: r.requirement,
      category: r.category,
      priority: CATEGORY_PRIORITY[r.category] || 'MEDIUM',
      status,
      evidence,
      evidenceSource,
      qualificationFinding: `${r.status} in qualification analysis`,
      remarks: r.remarks || '',
      reviewerState: override.reviewerState || 'PENDING',
      reviewerNote: override.reviewerNote || '',
    };
  });
}

// --- document verification -------------------------------------------------

/** Compare the opportunity's required documents against uploaded documents. */
export function evaluateDocuments(opportunity, documents = []) {
  return (opportunity.documentsRequired || []).map((req, i) => {
    const match = matchDocument(req, documents);
    let status = 'MISSING';
    if (match) status = match.status === 'Processed' ? 'AVAILABLE' : 'NEEDS_REVIEW';
    return {
      id: `doc-${i}-${slug(req)}`,
      required: req,
      status,
      matchedDocument: match ? match.name : null,
    };
  });
}

// --- scoring ---------------------------------------------------------------

/** Priority-weighted compliance score across all requirement items. */
export function calculateComplianceScore(items) {
  if (!items.length) return 0;
  let weighted = 0;
  let weight = 0;
  items.forEach((it) => {
    const w = PRIORITY_WEIGHT[it.priority] || 1;
    weighted += (STATUS_WEIGHT[it.status] ?? 0) * w;
    weight += w;
  });
  return Math.round(weighted / weight);
}

// --- risk register ---------------------------------------------------------

/** Requirement-linked compliance risks (+ reviewer status overrides). */
export function buildRiskRegister(items, docs, reviews = {}) {
  const riskReviews = reviews.risks || {};
  const risks = [];
  const push = (id, risk, severity, relatedRequirement, impact, mitigation) =>
    risks.push({ id, risk, severity, relatedRequirement, impact, mitigation, status: riskReviews[id] || 'Open' });

  items.forEach((it) => {
    const high = it.priority === 'CRITICAL' || it.priority === 'HIGH';
    if (it.status === 'MISSING') {
      push(`risk-${it.id}`, `${it.requirement} not evidenced`, high ? 'High' : 'Medium', it.requirement,
        high ? 'May prevent qualification for this opportunity.' : 'Weakens the submission if unaddressed.',
        'Verify the requirement and provide valid supporting evidence.');
    } else if (it.status === 'PARTIAL' && high) {
      push(`risk-${it.id}`, `${it.requirement} only partially evidenced`, 'Medium', it.requirement,
        'Partial coverage may be challenged during evaluation.', 'Strengthen the evidence or the proposal response.');
    }
  });

  docs.filter((d) => d.status === 'MISSING').forEach((d) =>
    push(`risk-${d.id}`, `${d.required} not uploaded`, 'High', d.required,
      'A missing required document can render the bid non-compliant.', `Prepare and upload: ${d.required}.`));

  if (!risks.length) {
    push('risk-none', 'No major compliance risks identified', 'Low', '—',
      'No blocking issues found in the mock analysis.', 'Proceed with a final human review before submission.');
  }
  return risks;
}

// --- readiness gate & blockers --------------------------------------------

/** Transparent gate rules — returns pass/fail checks and overall readiness. */
export function canMarkReady({ items, docs, risks, proposalReady }) {
  const highMissing = items.filter((i) => (i.priority === 'CRITICAL' || i.priority === 'HIGH') && i.status === 'MISSING');
  const openHighRisks = risks.filter((r) => r.severity === 'High' && r.status !== 'Resolved' && r.status !== 'Accepted');
  const missingDocs = docs.filter((d) => d.status === 'MISSING');
  const unresolvedClarify = items.filter((i) => i.reviewerState === 'NEEDS_CLARIFICATION' && (i.priority === 'CRITICAL' || i.priority === 'HIGH'));

  const checks = [
    { id: 'requirements', label: 'All high-priority requirements addressed', pass: highMissing.length === 0 },
    { id: 'documents', label: 'All required documents available', pass: missingDocs.length === 0 },
    { id: 'risks', label: 'No unresolved high-severity risks', pass: openHighRisks.length === 0 },
    { id: 'proposal', label: `Proposal readiness at least ${MIN_PROPOSAL_READINESS}%`, pass: proposalReady >= MIN_PROPOSAL_READINESS },
    { id: 'reviewer', label: 'No critical reviewer clarifications open', pass: unresolvedClarify.length === 0 },
  ];
  return { ready: checks.every((c) => c.pass), checks, highMissing, openHighRisks, missingDocs, unresolvedClarify };
}

/** Prioritised list of the items blocking internal-review readiness. */
export function identifyComplianceBlockers(gate, proposalReady) {
  const blockers = [];
  gate.highMissing.forEach((i) =>
    blockers.push({ severity: i.priority === 'CRITICAL' ? 'High' : 'High', requirement: i.requirement, state: 'Missing', action: `Provide evidence for "${i.requirement}" or confirm applicability with the compliance reviewer.` }));
  gate.missingDocs.forEach((d) =>
    blockers.push({ severity: 'High', requirement: d.required, state: 'Document missing', action: `Upload the required document: ${d.required}.` }));
  gate.openHighRisks.forEach((r) =>
    blockers.push({ severity: 'High', requirement: r.relatedRequirement, state: 'Open high risk', action: r.mitigation }));
  gate.unresolvedClarify.forEach((i) =>
    blockers.push({ severity: 'Medium', requirement: i.requirement, state: 'Needs clarification', action: 'Resolve the reviewer clarification before internal review.' }));
  if (!gate.checks.find((c) => c.id === 'proposal').pass) {
    blockers.push({ severity: 'Medium', requirement: 'Proposal coverage', state: `Proposal readiness ${proposalReady}%`, action: 'Complete more proposal sections before compliance can be marked ready.' });
  }
  return blockers;
}

function worseOf(a, b) {
  return STATUS_TIER[Math.min(STATUS_TIER.indexOf(a), STATUS_TIER.indexOf(b))];
}

/** Score band capped by the gate result. */
export function calculateReadiness(score, gate) {
  const band = READINESS_BANDS.find((b) => score >= b.min).status;
  if (gate.ready) return { score, status: band };
  const hasHigh = gate.highMissing.length || gate.openHighRisks.length || gate.missingDocs.length;
  const capped = worseOf(band, hasHigh ? 'NEEDS_ATTENTION' : 'MINOR_REVIEW');
  return { score, status: capped };
}

// --- top-level build -------------------------------------------------------

/**
 * Assemble the full ComplianceResult.
 * @returns {import('@/types').ComplianceResult}
 */
export function buildComplianceResult(opportunity, qualification, proposal, documents, reviews = {}) {
  const items = buildComplianceItems(qualification, documents, reviews);
  const docs = evaluateDocuments(opportunity, documents);
  const risks = buildRiskRegister(items, docs, reviews);
  const proposalReady = proposalReadiness(proposal);
  const score = calculateComplianceScore(items);
  const gate = canMarkReady({ items, docs, risks, proposalReady });
  const { status } = calculateReadiness(score, gate);
  const blockers = identifyComplianceBlockers(gate, proposalReady);

  return {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    organization: opportunity.organization,
    items,
    documents: docs,
    risks,
    proposalReadiness: proposalReady,
    readinessScore: score,
    readinessStatus: status,
    gate,
    blockers,
    counts: {
      addressed: items.filter((i) => i.status === 'ADDRESSED').length,
      partial: items.filter((i) => i.status === 'PARTIAL').length,
      missing: items.filter((i) => i.status === 'MISSING').length,
      needsReview: items.filter((i) => i.status === 'NEEDS_REVIEW').length,
      openRisks: risks.filter((r) => r.status !== 'Resolved' && r.status !== 'Accepted' && r.id !== 'risk-none').length,
      blocked: blockers.length,
    },
    lastUpdated: new Date().toISOString(),
    source: 'mock',
  };
}

/** Next actions tailored to the readiness state. */
export function complianceNextActions(result) {
  if (!result) return [];
  if (result.readinessStatus === 'READY') {
    return [
      'Conduct a final human review of requirements and evidence.',
      'Confirm proposal facts, figures and declarations.',
      'Complete the authorized government / procurement submission process outside GrantPilot.',
    ];
  }
  const actions = [];
  const missing = result.items.filter((i) => i.status === 'MISSING');
  if (missing.length) actions.push(`Resolve ${missing.length} missing requirement${missing.length > 1 ? 's' : ''}, starting with the highest priority.`);
  if (result.documents.some((d) => d.status === 'MISSING')) actions.push('Upload the missing required documents, then re-run the compliance check.');
  if (result.proposalReadiness < MIN_PROPOSAL_READINESS) actions.push('Complete more proposal sections to raise proposal readiness.');
  actions.push('Review partial and needs-review items and mark them for internal review.');
  return actions;
}
