// ---------------------------------------------------------------------------
// SNS Workbench service layer — production wiring + fallback
//
// Every page reaches the AI through this module, never directly. Each function:
//   1. Attempts a real call to the SNS Agent Workbench via the local proxy.
//   2. On success, returns the agent's structured JSON response.
//   3. On network error / timeout / 404 / inactive agent, falls back gracefully
//      to the deterministic local engines (qualificationEngine, complianceEngine
//      etc.) so the UI is never broken, even when the backend is inactive.
//
//   React Page → Context / Service → snsWorkbench.js → /api/agent/execute (proxy)
//                                                     → api.agents.snsihub.ai
//
// Agent endpoint: https://api.agents.snsihub.ai
// Form ID:        44a7adcb-5c25-4ef8-af59-5f0d2ab1b05f
// ---------------------------------------------------------------------------

import { callSNSAgent, sendAgentChat } from '@/lib/api';
import { runQualification } from '@/utils/qualificationEngine';
import { createProposalDraft, generateSectionContent } from '@/data/proposalSections';
import { buildComplianceResult } from '@/utils/complianceEngine';

// Re-export for backwards compat so any direct consumer of callSNSWorkbench still works
export { sendAgentChat as callSNSWorkbench };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Extract text from an agent response envelope regardless of field naming. */
function extractAgentText(data) {
  if (!data) return null;
  return data.reply || data.message || data.content || data.text || data.output || null;
}

/**
 * Try the SNS Agent Workbench; return { result, isFallback, agentReply }.
 * On any failure the caller receives isFallback = true and should use local engines.
 */
async function tryAgent(workflow, payload) {
  try {
    const res = await callSNSAgent('workflow', { workflow, ...payload });
    if (res.success && res.data) {
      return { result: res.data, isFallback: false, agentReply: extractAgentText(res.data), latencyMs: res.latencyMs };
    }
  } catch {
    // fall through
  }
  return { result: null, isFallback: true, agentReply: null };
}

// ---------------------------------------------------------------------------
// Workflow stubs — each mirrors an SNS Workbench workflow
// ---------------------------------------------------------------------------

/** Structure a company profile into the internal representation. */
export async function analyzeCompany(profile) {
  const { result, isFallback } = await tryAgent('analyze-company', { profile });
  if (!isFallback && result) return { ...profile, ...result, analyzed: true };
  return { ...profile, analyzed: true };
}

/** Extract text from an uploaded document. */
export async function processDocument(doc) {
  const { result, isFallback } = await tryAgent('process-document', { document: doc });
  if (!isFallback && result) {
    return { ...doc, status: 'Processed', extractedText: extractAgentText(result) || result.extractedText, isSNSResult: true };
  }
  // Local fallback: simulate a short processing delay then flip to Processed
  await new Promise((r) => setTimeout(r, 800));
  return {
    ...doc,
    status: 'Processed',
    extractedText: `Mock extracted text for "${doc.name}". Connect the SNS Agent Workbench workflow to enable real PDF/OCR extraction.`,
  };
}

/** Rank opportunities against the profile. */
export async function findMatches(profile, opportunities) {
  const { result, isFallback } = await tryAgent('find-matches', { profile, opportunityIds: opportunities.map(o => o.id) });
  if (!isFallback && Array.isArray(result?.ranked)) return result.ranked;
  // Local fallback
  await new Promise((r) => setTimeout(r, 600));
  return [...opportunities].sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Full bid-fit qualification for one opportunity.
 * Returns the qualification result and annotates it with SNS metadata.
 */
export async function analyzeOpportunity(profile, documents, opportunity) {
  const { result, isFallback, latencyMs } = await tryAgent('analyze-opportunity', {
    profile,
    documents: documents.map(d => ({ id: d.id, name: d.name, type: d.type, status: d.status })),
    opportunity,
  });

  if (!isFallback && result) {
    // Agent returned a structured result — annotate with SNS metadata
    return {
      ...result,
      _meta: { source: 'SNS Agent Workbench', latencyMs, timestamp: new Date().toISOString() },
    };
  }

  // Local fallback
  const local = runQualification(profile, documents, opportunity);
  return {
    ...local,
    _meta: { source: 'Local Engine (Fallback)', latencyMs: null, timestamp: new Date().toISOString() },
  };
}

/** Eligibility-only check. */
export async function checkEligibility(profile, opportunity) {
  const { result, isFallback } = await tryAgent('check-eligibility', { profile, opportunity });
  if (!isFallback && result) return result;
  // Local fallback
  await new Promise((r) => setTimeout(r, 400));
  const items = opportunity.eligibility || [];
  const failed = items.filter((e) => e.status === 'fail');
  return { pass: failed.length === 0, items, failed };
}

/** Gap analysis. */
export async function runGapAnalysis(profile, opportunity) {
  const { result, isFallback } = await tryAgent('gap-analysis', { profile, opportunity });
  if (!isFallback && Array.isArray(result?.gaps)) return result.gaps;
  await new Promise((r) => setTimeout(r, 600));
  return (opportunity.matchDetails || [])
    .filter((d) => d.status !== 'Matched')
    .map((d) => ({ requirement: d.requirement, status: d.status, evidence: d.evidence }));
}

/**
 * Generate a full proposal draft, or regenerate a single section.
 * When a qualification result is supplied the output reflects the analysis.
 */
export async function generateProposal(profile, opportunity, sectionId = null, qualification = null) {
  const { result, isFallback } = await tryAgent('generate-proposal', { profile, opportunity, sectionId, qualification });

  if (!isFallback && result) {
    if (sectionId) return result.content || result;
    return result;
  }

  // Local fallback
  await new Promise((r) => setTimeout(r, sectionId ? 1000 : 1400));
  if (sectionId) return generateSectionContent(sectionId, profile, opportunity, qualification);
  return createProposalDraft(opportunity, profile, qualification);
}

/** Compliance readiness report for an opportunity (consumes qualification). */
export async function checkCompliance(opportunity, qualification, proposal, documents, reviews = {}) {
  const { result, isFallback } = await tryAgent('check-compliance', {
    opportunity,
    qualification,
    proposal,
    documents: documents.map(d => ({ id: d.id, name: d.name, type: d.type, status: d.status })),
    reviews,
  });

  if (!isFallback && result) return result;

  await new Promise((r) => setTimeout(r, 800));
  return buildComplianceResult(opportunity, qualification, proposal, documents, reviews);
}
