// ---------------------------------------------------------------------------
// GrantPilot qualification engine (deterministic mock, decision-support only).
//
// Pure functions — no React, no network. Given the company profile, uploaded
// documents and an opportunity, it produces the QualificationResult the UI
// renders. The same inputs always produce the same output. This is the layer
// the SNS Workbench bid-fit workflow replaces later; the output shape is the
// contract the UI depends on.
// ---------------------------------------------------------------------------

import { requirementsFor } from '@/data/capabilityRequirements';

// Single source of truth for the scoring model.
export const QUALIFICATION_WEIGHTS = {
  technical: 0.30,
  sector: 0.20,
  capability: 0.20,
  experience: 0.15,
  eligibility: 0.15,
};

const norm = (s = '') => s.trim().toLowerCase();
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

/** Match-class label for any 0-100 score. Deterministic ranges. */
export function classifyScore(score) {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Weak';
  return 'Low';
}

// --- capability & certification helpers ----------------------------------

function hasCapability(profile, cap) {
  const techs = (profile.technologies || []).map(norm);
  if (techs.includes(norm(cap))) return 'matched';
  // Soft evidence: mentioned in free-text capabilities/products but not a tag.
  const text = norm(`${profile.capabilities || ''} ${profile.products || ''}`);
  if (text.includes(norm(cap))) return 'partial';
  return 'missing';
}

function certificationMet(profile, documents, cert) {
  const held = (profile.certifications || []).map(norm);
  if (held.some((c) => c.includes(norm(cert)) || norm(cert).includes(c))) return true;
  // Document evidence: a Certificate whose file name references the cert.
  return (documents || []).some(
    (d) => d.type === 'Certificate' && norm(d.name).includes(norm(cert).replace(/\s+/g, '')),
  );
}

function hasDocType(documents, type) {
  return (documents || []).some((d) => d.type === type);
}

// --- sub-scores -----------------------------------------------------------

function technicalScore(opportunity) {
  const rows = opportunity.matchDetails || [];
  if (!rows.length) return 0;
  const w = { Matched: 1, Partial: 0.5, Gap: 0 };
  return pct(rows.reduce((s, r) => s + (w[r.status] ?? 0), 0), rows.length);
}

function sectorScore(profile, opportunity) {
  if (!profile.sector || !opportunity.sector) return 0;
  if (profile.sector === opportunity.sector) return 100;
  const a = norm(profile.sector.split('/')[0]);
  const b = norm(opportunity.sector.split('/')[0]);
  return a === b ? 70 : 35;
}

function capabilityBreakdown(profile, opportunity) {
  const { requiredCapabilities } = requirementsFor(opportunity.id);
  const matched = [];
  const partial = [];
  const missing = [];
  requiredCapabilities.forEach((cap) => {
    const state = hasCapability(profile, cap);
    if (state === 'matched') matched.push(cap);
    else if (state === 'partial') partial.push(cap);
    else missing.push(cap);
  });
  const score = requiredCapabilities.length
    ? pct(matched.length + partial.length * 0.5, requiredCapabilities.length)
    : 60;
  return { required: requiredCapabilities, matched, partial, missing, score };
}

function experienceScore(profile, documents) {
  const years = Number(profile.experienceYears) || 0;
  const team = Number(profile.teamSize) || 0;
  let score = (Math.min(years / 5, 1) * 0.5 + Math.min(team / 20, 1) * 0.5) * 100;
  if ((profile.previousGovProjects || '').trim()) score += 10;
  if (hasDocType(documents, 'Project Report')) score += 5;
  return Math.min(Math.round(score), 100);
}

// --- eligibility ----------------------------------------------------------

const BASE_ELIG = { pass: 'PASS', partial: 'PARTIAL', fail: 'FAIL' };

function evaluateEligibility(profile, documents, opportunity) {
  const { requiredCertifications } = requirementsFor(opportunity.id);
  const years = Number(profile.experienceYears) || 0;

  const items = (opportunity.eligibility || []).map((e) => {
    let status = BASE_ELIG[e.status] || 'UNKNOWN';
    let explanation = '';
    let evidence = '';
    const t = norm(e.requirement);

    if (/(year|experience|operation)/.test(t)) {
      status = years >= 3 ? 'PASS' : 'PARTIAL';
      explanation = `Company reports ${years} years of operation.`;
      evidence = 'Company profile';
    } else if (/(certification|iso|cert-in|empanel|clearance)/.test(t)) {
      const met = requiredCertifications.length
        ? requiredCertifications.every((c) => certificationMet(profile, documents, c))
        : (profile.certifications || []).length > 0;
      status = met ? 'PASS' : e.status === 'fail' ? 'FAIL' : 'PARTIAL';
      explanation = met
        ? 'Required certifications are recorded in the profile or documents.'
        : `Missing: ${requiredCertifications.filter((c) => !certificationMet(profile, documents, c)).join(', ') || 'required certification'}.`;
      evidence = met ? 'Profile certifications / uploaded documents' : 'No supporting document found';
    } else if (/(dpiit|registered|msme|indian|entity|ownership)/.test(t)) {
      status = 'PASS';
      explanation = 'Registered Indian entity per company profile.';
      evidence = 'Company profile';
    } else if (/(turnover|revenue|financial|value)/.test(t)) {
      status = hasDocType(documents, 'Financial Document') ? 'PASS' : status === 'PASS' ? 'PASS' : 'PARTIAL';
      explanation = hasDocType(documents, 'Financial Document')
        ? 'Financial document available.'
        : 'Financial evidence recommended to confirm this criterion.';
      evidence = hasDocType(documents, 'Financial Document') ? 'Uploaded financial document' : 'Not provided';
    } else {
      explanation = 'Assessed from the opportunity eligibility criteria.';
      evidence = 'Opportunity notice';
    }
    return { requirement: e.requirement, status, explanation, evidence };
  });

  const fails = items.filter((i) => i.status === 'FAIL').length;
  const partials = items.filter((i) => i.status === 'PARTIAL').length;
  let overall = 'PASS';
  if (fails > 0) overall = 'FAIL';
  else if (partials > items.length / 2) overall = 'PARTIAL';
  const score = items.length
    ? pct(items.reduce((s, i) => s + (i.status === 'PASS' ? 1 : i.status === 'PARTIAL' ? 0.5 : 0), 0), items.length)
    : 0;

  return { items, overall, score };
}

// --- requirement analysis (grouped) --------------------------------------

const MATCH_MAP = { Matched: 'Matched', Partial: 'Partial', Gap: 'Missing' };

function buildRequirements(profile, documents, opportunity, capability, eligibility) {
  const { requiredCertifications } = requirementsFor(opportunity.id);
  const reqs = [];

  // Technical (from match details / technical requirements)
  (opportunity.matchDetails || []).forEach((m) =>
    reqs.push({ category: 'Technical', requirement: m.requirement, status: MATCH_MAP[m.status] || 'Review', evidence: m.evidence, remarks: '' }));

  // Capability
  capability.matched.forEach((c) => reqs.push({ category: 'Capability', requirement: `${c} capability`, status: 'Matched', evidence: 'Company technology profile', remarks: '' }));
  capability.partial.forEach((c) => reqs.push({ category: 'Capability', requirement: `${c} capability`, status: 'Partial', evidence: 'Referenced in capabilities text', remarks: 'Not listed as a core technology' }));
  capability.missing.forEach((c) => reqs.push({ category: 'Capability', requirement: `${c} capability`, status: 'Missing', evidence: 'Not found in profile', remarks: 'Add to profile or provide evidence' }));

  // Certification
  requiredCertifications.forEach((c) => {
    const met = certificationMet(profile, documents, c);
    reqs.push({ category: 'Certification', requirement: `${c} certification`, status: met ? 'Matched' : 'Missing', evidence: met ? 'Profile / uploaded document' : 'No supporting document found', remarks: met ? '' : 'Verify whether mandatory' });
  });

  // Eligibility
  eligibility.items.forEach((e) =>
    reqs.push({ category: 'Eligibility', requirement: e.requirement, status: e.status === 'PASS' ? 'Matched' : e.status === 'PARTIAL' ? 'Partial' : e.status === 'FAIL' ? 'Missing' : 'Review', evidence: e.evidence, remarks: e.explanation }));

  // Experience
  const govExp = (profile.previousGovProjects || '').trim();
  reqs.push({ category: 'Experience', requirement: 'Relevant delivery experience', status: govExp ? 'Matched' : 'Partial', evidence: govExp ? 'Previous projects in profile' : 'No government deployment recorded', remarks: govExp ? '' : 'Commercial experience only' });

  // Documentation
  (opportunity.documentsRequired || []).forEach((d) => {
    const matchedDoc = (documents || []).some((doc) => {
      const t = norm(doc.type);
      return norm(d).includes(t) || t.split(' ').some((w) => w.length > 3 && norm(d).includes(w));
    });
    reqs.push({ category: 'Documentation', requirement: d, status: matchedDoc ? 'Matched' : 'Missing', evidence: matchedDoc ? 'Uploaded document' : 'Not uploaded', remarks: '' });
  });

  // Submission (always a human step)
  reqs.push({ category: 'Submission', requirement: 'Signed declaration & undertaking', status: 'Review', evidence: 'Prepared at submission', remarks: 'Requires authorised signatory' });

  return reqs;
}

// --- gaps & risks ---------------------------------------------------------

function identifyGaps(profile, documents, opportunity, capability, eligibility) {
  const { requiredCertifications } = requirementsFor(opportunity.id);
  const gaps = [];

  capability.missing.forEach((c) =>
    gaps.push({ category: 'Capability', description: `${c} capability not evidenced`, severity: 'High', suggestedAction: `Add ${c} to the company profile or attach supporting technical evidence.` }));
  capability.partial.forEach((c) =>
    gaps.push({ category: 'Capability', description: `${c} only partially evidenced`, severity: 'Medium', suggestedAction: `Promote ${c} to a listed technology and cite a project that used it.` }));

  requiredCertifications.filter((c) => !certificationMet(profile, documents, c)).forEach((c) =>
    gaps.push({ category: 'Certification', description: `${c} certification missing`, severity: 'High', suggestedAction: `Verify whether ${c} is mandatory and identify an approved certification path.` }));

  (opportunity.documentsRequired || []).forEach((d) => {
    const matchedDoc = (documents || []).some((doc) => norm(d).includes(norm(doc.type)));
    if (!matchedDoc) gaps.push({ category: 'Documentation', description: `${d} not uploaded`, severity: 'Medium', suggestedAction: `Prepare and upload: ${d}.` });
  });

  if (!(profile.previousGovProjects || '').trim()) {
    gaps.push({ category: 'Experience', description: 'No prior government deployment evidence', severity: 'Medium', suggestedAction: 'Document any pilot or public-sector engagement, however small.' });
  }

  return gaps;
}

function identifyRisks(eligibility, gaps) {
  const risks = [];
  const highGaps = gaps.filter((g) => g.severity === 'High');
  highGaps.forEach((g) =>
    risks.push({ title: g.description, severity: 'High', explanation: 'A high-severity gap can make the bid non-compliant if the requirement is mandatory.', recommendedAction: g.suggestedAction }));

  if (eligibility.overall === 'PARTIAL') {
    risks.push({ title: 'Eligibility only partially satisfied', severity: 'Medium', explanation: 'One or more eligibility criteria are partially met and need confirmation.', recommendedAction: 'Confirm each partial eligibility item with the responsible team.' });
  } else if (eligibility.overall === 'FAIL') {
    risks.push({ title: 'Eligibility criterion not met', severity: 'High', explanation: 'At least one eligibility criterion is currently failing.', recommendedAction: 'Resolve the failing criterion before investing in a proposal.' });
  }

  gaps.filter((g) => g.severity === 'Medium').slice(0, 2).forEach((g) =>
    risks.push({ title: g.description, severity: 'Medium', explanation: 'A medium-severity gap may weaken the submission if left unaddressed.', recommendedAction: g.suggestedAction }));

  if (!risks.length) {
    risks.push({ title: 'No major risks identified', severity: 'Low', explanation: 'No blocking issues found in the mock analysis.', recommendedAction: 'Proceed with a final human review before submission.' });
  }
  return risks;
}

// --- evidence / reasoning -------------------------------------------------

function buildEvidence(profile, opportunity, scores, capability, eligibility) {
  const positives = [];
  const cautions = [];

  if (scores.sector >= 70) positives.push('Operates in the same sector as the opportunity.');
  if (capability.matched.length) positives.push(`Required capabilities present: ${capability.matched.join(', ')}.`);
  if (scores.technical >= 70) positives.push('Most technical requirements are supported by the profile.');
  if ((profile.previousGovProjects || '').trim()) positives.push('Relevant delivery experience is documented.');
  if (eligibility.overall === 'PASS') positives.push('Eligibility criteria appear to be met.');

  if (capability.missing.length) cautions.push(`Capabilities not evidenced: ${capability.missing.join(', ')}.`);
  if (eligibility.overall !== 'PASS') cautions.push('Some eligibility criteria need confirmation.');
  if (scores.experience < 60) cautions.push('Experience footprint is limited for this scale of work.');

  const evidence = [
    ...positives.map((text) => ({ polarity: 'positive', text })),
    ...cautions.map((text) => ({ polarity: 'caution', text })),
  ];
  if (!evidence.length) evidence.push({ polarity: 'caution', text: 'Insufficient profile data for a confident assessment.' });
  return evidence;
}

// --- recommendation -------------------------------------------------------

export function generateRecommendation(overallScore, eligibility, gaps) {
  const highGaps = gaps.filter((g) => g.severity === 'High').length;
  if (overallScore >= 75 && eligibility.overall === 'PASS' && highGaps <= 1) return 'PURSUE';
  if (overallScore >= 55 && eligibility.overall !== 'FAIL') return 'REVIEW';
  return 'SKIP';
}

function confidenceFor(score) {
  if (score >= 80 || score < 40) return 'HIGH';
  if (score >= 55 && score <= 64) return 'LOW';
  return 'MEDIUM';
}

const NEXT_ACTIONS = {
  PURSUE: [
    'Verify the remaining requirements flagged below.',
    'Review supporting documents for completeness.',
    'Start the proposal draft.',
  ],
  REVIEW: [
    'Resolve the open eligibility questions.',
    'Gather evidence for the missing capabilities.',
    'Discuss fit with the technical and compliance team.',
  ],
  SKIP: [
    'Review the reasons for the mismatch below.',
    'Explore other opportunities that fit the profile better.',
  ],
};

function reasonFor(recommendation, opportunity, gaps) {
  const highGaps = gaps.filter((g) => g.severity === 'High').length;
  if (recommendation === 'PURSUE') return `Strong alignment with ${opportunity.organization}. ${highGaps ? `Verify ${highGaps} outstanding item before submission.` : 'No blocking gaps identified.'}`;
  if (recommendation === 'REVIEW') return `Partial fit — worth a closer look. ${gaps.length} gap${gaps.length === 1 ? '' : 's'} would need attention before committing effort.`;
  return `Weak fit for the current profile: ${gaps.filter((g) => g.severity === 'High').length} high-severity gap${highGaps === 1 ? '' : 's'} and/or unmet eligibility.`;
}

/**
 * Main entry point.
 * @returns {import('@/types').QualificationResult}
 */
export function runQualification(profile, documents, opportunity) {
  const technical = technicalScore(opportunity);
  const sector = sectorScore(profile, opportunity);
  const capability = capabilityBreakdown(profile, opportunity);
  const experience = experienceScore(profile, documents);
  const eligibility = evaluateEligibility(profile, documents, opportunity);

  const scores = { technical, sector, capability: capability.score, experience, eligibility: eligibility.score };

  const overallScore = Math.round(
    technical * QUALIFICATION_WEIGHTS.technical +
    sector * QUALIFICATION_WEIGHTS.sector +
    capability.score * QUALIFICATION_WEIGHTS.capability +
    experience * QUALIFICATION_WEIGHTS.experience +
    eligibility.score * QUALIFICATION_WEIGHTS.eligibility,
  );

  const requirements = buildRequirements(profile, documents, opportunity, capability, eligibility);
  const gaps = identifyGaps(profile, documents, opportunity, capability, eligibility);
  const risks = identifyRisks(eligibility, gaps);
  const evidence = buildEvidence(profile, opportunity, scores, capability, eligibility);
  const recommendation = generateRecommendation(overallScore, eligibility, gaps);

  const explain = (score) => {
    const c = classifyScore(score);
    return { Strong: 'Well supported by the profile.', Moderate: 'Reasonably supported, some gaps.', Weak: 'Limited support in the profile.', Low: 'Little to no support found.' }[c];
  };

  return {
    opportunityId: opportunity.id,
    overallScore,
    matchClass: classifyScore(overallScore),
    scoreBreakdown: {
      technical: { score: technical, status: classifyScore(technical), explanation: explain(technical) },
      sector: { score: sector, status: classifyScore(sector), explanation: explain(sector) },
      capability: { score: capability.score, status: classifyScore(capability.score), explanation: explain(capability.score) },
      experience: { score: experience, status: classifyScore(experience), explanation: explain(experience) },
      eligibility: { score: eligibility.score, status: classifyScore(eligibility.score), explanation: explain(eligibility.score) },
    },
    eligibilityStatus: eligibility.overall,
    eligibilityItems: eligibility.items,
    capabilityMatch: {
      required: capability.required,
      matched: capability.matched,
      partial: capability.partial,
      missing: capability.missing,
    },
    requirements,
    gaps,
    risks,
    evidence,
    recommendation,
    confidence: confidenceFor(overallScore),
    reason: reasonFor(recommendation, opportunity, gaps),
    nextActions: NEXT_ACTIONS[recommendation],
    analyzedAt: new Date().toISOString(),
    source: 'mock',
  };
}
