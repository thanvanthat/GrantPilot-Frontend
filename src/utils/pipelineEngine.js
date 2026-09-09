// ---------------------------------------------------------------------------
// GrantPilot pipeline engine (deterministic, decision-support only).
//
// Builds one enriched "portfolio row" per opportunity by joining the shared
// context data (opportunity + status + qualification + proposal + compliance).
// Pipeline, Compare, Reports and the Dashboard all consume these rows, so
// there is a single source of truth and no duplicated opportunity records.
// ---------------------------------------------------------------------------

import { proposalReadiness } from '@/data/proposalSections';

/** Deadline is stored as "days remaining". Classify it. */
export function deadlineState(days) {
  if (days <= 0) return 'PAST';
  if (days <= 7) return 'DUE_SOON';
  return 'UPCOMING';
}

export const DEADLINE_LABEL = { PAST: 'Past', DUE_SOON: 'Due soon', UPCOMING: 'Upcoming' };

/** Priority for review — HIGH / MEDIUM / LOW, from available signals only. */
export function calculateOpportunityPriority(row) {
  if (row.status === 'Skipped') return 'LOW';
  const dueSoon = row.deadlineState === 'DUE_SOON' || row.deadlineState === 'PAST';
  if (!row.analyzed) return dueSoon ? 'MEDIUM' : 'LOW';

  const viable = row.eligibility !== 'FAIL';
  if (row.matchScore >= 75 && viable) return 'HIGH';
  if (row.status === 'Pursuing' && viable) return 'HIGH';
  if (dueSoon && row.matchScore >= 60 && viable) return 'HIGH';
  if (row.matchScore < 40 || row.eligibility === 'FAIL' || row.recommendation === 'SKIP') return 'LOW';
  return 'MEDIUM';
}

/** Health signal — HEALTHY / NEEDS_ATTENTION / BLOCKED. */
export function calculateOpportunityHealth(row) {
  if (row.analyzed && row.eligibility === 'FAIL') return 'BLOCKED';
  if (row.complianceHighBlockers > 0) return 'BLOCKED';
  if (!row.analyzed) return 'NEEDS_ATTENTION';
  if (row.recommendation === 'SKIP') return 'NEEDS_ATTENTION';
  const complianceIssue = row.compliance && (row.complianceStatus === 'NEEDS_ATTENTION' || row.complianceStatus === 'NOT_READY');
  if (complianceIssue || row.gapsHigh > 0) return 'NEEDS_ATTENTION';
  return 'HEALTHY';
}

function ts(iso) {
  const t = iso ? new Date(iso).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

/**
 * Join context data into one enriched row per opportunity.
 * @returns {import('@/types').PortfolioRow[]}
 */
export function buildPortfolioRows({ matches = [], statuses = {}, qualifications = {}, proposals = {}, complianceResults = {} }) {
  return matches.map((o) => {
    const q = qualifications[o.id] || null;
    const p = proposals[o.id] || null;
    const c = complianceResults[o.id] || null;

    const row = {
      id: o.id,
      title: o.title,
      organization: o.organization,
      sector: o.sector,
      type: o.type,
      budget: o.budget,
      deadline: o.deadline,
      deadlineState: deadlineState(o.deadline),
      technicalRequirements: o.technicalRequirements || [],

      status: statuses[o.id] || 'New',

      analyzed: Boolean(q),
      matchScore: q ? q.overallScore : null,
      matchClass: q ? q.matchClass : null,
      eligibility: q ? q.eligibilityStatus : null,
      recommendation: q ? q.recommendation : null,
      scoreBreakdown: q ? q.scoreBreakdown : null,
      gapsCount: q ? q.gaps.length : 0,
      gapsHigh: q ? q.gaps.filter((g) => g.severity === 'High').length : 0,

      proposal: Boolean(p),
      proposalStatus: p ? p.status : null,
      proposalReadiness: p ? proposalReadiness(p) : null,

      compliance: Boolean(c),
      complianceReadiness: c ? c.readinessScore : null,
      complianceStatus: c ? c.readinessStatus : null,
      openRisks: c ? c.counts.openRisks : 0,
      complianceHighBlockers: c ? (c.blockers || []).filter((b) => b.severity === 'High').length : 0,

      updatedAt: Math.max(ts(q?.analyzedAt), ts(p?.updatedAt), ts(c?.lastUpdated)),
    };
    row.priority = calculateOpportunityPriority(row);
    row.health = calculateOpportunityHealth(row);
    return row;
  });
}

// --- counts / metrics / sort / filter ------------------------------------

export function getStatusCounts(rows) {
  const counts = { New: 0, Reviewing: 0, Pursuing: 0, Skipped: 0 };
  rows.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  return counts;
}

export function calculatePipelineMetrics(rows) {
  const counts = getStatusCounts(rows);
  return { total: rows.length, ...counts, active: rows.length - counts.Skipped };
}

const PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/** Numeric budget value (normalised to lakhs) for sorting Cr vs L. */
function budgetValue(budget = '') {
  const num = parseFloat(String(budget).replace(/[^\d.]/g, '')) || 0;
  return /cr/i.test(budget) ? num * 100 : num;
}

export function sortPipelineOpportunities(rows, sortKey) {
  const copy = [...rows];
  switch (sortKey) {
    case 'match':
      // analysed first (desc by score), unanalysed after.
      return copy.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
    case 'deadline':
      return copy.sort((a, b) => a.deadline - b.deadline);
    case 'budget':
      return copy.sort((a, b) => budgetValue(b.budget) - budgetValue(a.budget));
    case 'priority':
      return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case 'updated':
      return copy.sort((a, b) => b.updatedAt - a.updatedAt);
    default:
      return copy;
  }
}

/** filters: { status, sector, recommendation, eligibility, priority, deadline, query } */
export function filterPipelineOpportunities(rows, filters = {}) {
  const q = (filters.query || '').trim().toLowerCase();
  return rows.filter((r) => {
    if (filters.status && filters.status !== 'All' && r.status !== filters.status) return false;
    if (filters.sector && filters.sector !== 'All' && r.sector !== filters.sector) return false;
    if (filters.priority && filters.priority !== 'All' && r.priority !== filters.priority) return false;
    if (filters.deadline && filters.deadline !== 'All' && r.deadlineState !== filters.deadline) return false;
    if (filters.recommendation && filters.recommendation !== 'All') {
      if (filters.recommendation === 'Not Analyzed') { if (r.analyzed) return false; }
      else if (r.recommendation !== filters.recommendation) return false;
    }
    if (filters.eligibility && filters.eligibility !== 'All') {
      if (!r.analyzed || r.eligibility !== filters.eligibility) return false;
    }
    if (q) {
      const hay = `${r.title} ${r.organization} ${r.sector} ${r.technicalRequirements.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
