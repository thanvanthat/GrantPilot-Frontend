// ---------------------------------------------------------------------------
// SNS Workbench service layer.
//
// Every page reaches the "AI" through this module, never directly. Today each
// function resolves a deterministic MOCK derived from local data; in a later
// phase the bodies are swapped to POST to the SNS Workbench webhook and return
// the structured JSON it produces. No page or component needs to change when
// that swap happens.
//
//   React Page → Context / Service → snsWorkbench.js → [ mock now | SNS later ]
//
// TODO (Phase 7+): replace each mock body with a callSNSWorkbench() request.
// ---------------------------------------------------------------------------

import { API_URL, simulateAiDelay } from '@/lib/api';
import { runQualification } from '@/utils/qualificationEngine';
import { createProposalDraft, generateSectionContent } from '@/data/proposalSections';
import { buildComplianceResult } from '@/utils/complianceEngine';

/**
 * The single real network entry point. Unused while mocks are active, but
 * kept here so the wiring is obvious for the integration phase.
 * @param {string} workflow  SNS Workbench workflow name
 * @param {unknown} payload
 */
export async function callSNSWorkbench(workflow, payload) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, payload }),
    });
    return await response.json();
  } catch (error) {
    console.error('SNS Workbench API error:', error);
    return null;
  }
}

// --- Workflow stubs -------------------------------------------------------
// Each mirrors an SNS Workbench workflow and returns a mock Promise for now.

/** Structure a company profile into the internal representation. */
export async function analyzeCompany(profile) {
  await simulateAiDelay(800);
  return { ...profile, analyzed: true };
}

/** Extract text from an uploaded document (mocked). */
export async function processDocument(doc) {
  await simulateAiDelay(1200);
  return {
    ...doc,
    status: 'Processed',
    extractedText: `Mock extracted text for "${doc.name}". Real PDF extraction arrives with the SNS Workbench integration.`,
  };
}

/** Rank opportunities against the profile (mock: re-rank by score). */
export async function findMatches(profile, opportunities) {
  await simulateAiDelay(1600);
  return [...opportunities].sort((a, b) => b.matchScore - a.matchScore);
}

/** Full bid-fit qualification for one opportunity. */
export async function analyzeOpportunity(profile, documents, opportunity) {
  await simulateAiDelay(1600);
  return runQualification(profile, documents, opportunity);
}

/** Eligibility-only check (mock: reads the opportunity's eligibility rows). */
export async function checkEligibility(profile, opportunity) {
  await simulateAiDelay(600);
  const items = opportunity.eligibility || [];
  const failed = items.filter((e) => e.status === 'fail');
  return { pass: failed.length === 0, items, failed };
}

/** Gap analysis (mock: derives gaps from match details). */
export async function runGapAnalysis(profile, opportunity) {
  await simulateAiDelay(800);
  return (opportunity.matchDetails || [])
    .filter((d) => d.status !== 'Matched')
    .map((d) => ({ requirement: d.requirement, status: d.status, evidence: d.evidence }));
}

/** Generate a full proposal draft, or regenerate a single section. When a
 *  qualification result is supplied the output reflects the analysis. */
export async function generateProposal(profile, opportunity, sectionId = null, qualification = null) {
  await simulateAiDelay(sectionId ? 1200 : 1600);
  if (sectionId) return generateSectionContent(sectionId, profile, opportunity, qualification);
  return createProposalDraft(opportunity, profile, qualification);
}

/** Compliance readiness report for an opportunity (consumes qualification). */
export async function checkCompliance(opportunity, qualification, proposal, documents, reviews = {}) {
  await simulateAiDelay(1000);
  return buildComplianceResult(opportunity, qualification, proposal, documents, reviews);
}
