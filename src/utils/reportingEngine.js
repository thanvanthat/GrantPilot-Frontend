// Portfolio reporting metrics. Pure functions over the enriched portfolio rows
// (and raw proposal/compliance maps where needed). No React, no side effects.

import { getStatusCounts } from '@/utils/pipelineEngine';
import { proposalReadiness } from '@/data/proposalSections';

const avg = (nums) => (nums.length ? Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) : 0);
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

export function calculatePipelineMetrics(rows) {
  const counts = getStatusCounts(rows);
  const total = rows.length;
  const withPct = (n) => ({ count: n, pct: pct(n, total) });
  return {
    total,
    active: total - counts.Skipped,
    New: withPct(counts.New),
    Reviewing: withPct(counts.Reviewing),
    Pursuing: withPct(counts.Pursuing),
    Skipped: withPct(counts.Skipped),
  };
}

export function calculateQualificationMetrics(rows) {
  const analysed = rows.filter((r) => r.analyzed);
  const scores = analysed.map((r) => r.matchScore);
  return {
    analyzed: analysed.length,
    notAnalyzed: rows.length - analysed.length,
    strong: analysed.filter((r) => r.matchScore >= 80).length,
    moderate: analysed.filter((r) => r.matchScore >= 60 && r.matchScore < 80).length,
    weak: analysed.filter((r) => r.matchScore < 60).length,
    averageMatch: avg(scores),
  };
}

export function calculateProposalMetrics(proposals) {
  const list = Object.values(proposals || {});
  const readiness = list.map((p) => proposalReadiness(p));
  return {
    total: list.length,
    draft: list.filter((p) => (p.status || 'Draft') === 'Draft').length,
    inReview: list.filter((p) => p.status === 'In Review').length,
    ready: list.filter((p) => p.status === 'Ready').length,
    averageReadiness: avg(readiness),
  };
}

export function calculateComplianceMetrics(complianceResults) {
  const list = Object.values(complianceResults || {});
  return {
    reviewed: list.length,
    ready: list.filter((c) => c.readinessStatus === 'READY').length,
    needsAttention: list.filter((c) => c.readinessStatus === 'NEEDS_ATTENTION' || c.readinessStatus === 'MINOR_REVIEW').length,
    notReady: list.filter((c) => c.readinessStatus === 'NOT_READY').length,
    averageReadiness: avg(list.map((c) => c.readinessScore)),
  };
}

export function calculateSectorDistribution(rows) {
  const map = {};
  rows.forEach((r) => { map[r.sector] = (map[r.sector] || 0) + 1; });
  return Object.entries(map)
    .map(([sector, count]) => ({ sector, count, pct: pct(count, rows.length) }))
    .sort((a, b) => b.count - a.count);
}

export function calculateRecommendationDistribution(rows) {
  const out = { PURSUE: 0, REVIEW: 0, SKIP: 0, 'Not Analyzed': 0 };
  rows.forEach((r) => { out[r.analyzed ? r.recommendation : 'Not Analyzed'] += 1; });
  return out;
}

export function calculateMatchDistribution(rows) {
  const analysed = rows.filter((r) => r.analyzed);
  return {
    hasData: analysed.length > 0,
    buckets: [
      { label: '80–100', count: analysed.filter((r) => r.matchScore >= 80).length },
      { label: '60–79', count: analysed.filter((r) => r.matchScore >= 60 && r.matchScore < 80).length },
      { label: '40–59', count: analysed.filter((r) => r.matchScore >= 40 && r.matchScore < 60).length },
      { label: '0–39', count: analysed.filter((r) => r.matchScore < 40).length },
    ],
    total: analysed.length,
  };
}

export function calculateDeadlineMetrics(rows) {
  return {
    past: rows.filter((r) => r.deadlineState === 'PAST').length,
    dueSoon: rows.filter((r) => r.deadlineState === 'DUE_SOON').length,
    upcoming: rows.filter((r) => r.deadlineState === 'UPCOMING').length,
  };
}

/** Opportunities that need a human to look at them, with a reason + action. */
export function getAttentionItems(rows) {
  const items = [];
  rows.forEach((r) => {
    if (r.status === 'Skipped') return;
    if (r.deadlineState === 'DUE_SOON' || r.deadlineState === 'PAST') {
      items.push({ id: r.id, title: r.title, severity: 'High', reason: `Deadline ${r.deadline <= 0 ? 'has passed' : `in ${r.deadline} days`}.`, action: 'View Opportunity', to: `/opportunities/${r.id}` });
    }
    if (!r.analyzed) {
      items.push({ id: r.id, title: r.title, severity: 'Medium', reason: 'Qualification not yet run.', action: 'Run Qualification', to: `/opportunities/${r.id}` });
      return;
    }
    if (r.eligibility === 'FAIL') {
      items.push({ id: r.id, title: r.title, severity: 'High', reason: 'Eligibility assessed as FAIL.', action: 'Review Qualification', to: `/opportunities/${r.id}` });
    }
    if (r.complianceHighBlockers > 0) {
      items.push({ id: r.id, title: r.title, severity: 'High', reason: `${r.complianceHighBlockers} critical compliance blocker${r.complianceHighBlockers > 1 ? 's' : ''}.`, action: 'Review Compliance', to: `/compliance?opportunity=${r.id}` });
    }
    if (r.matchScore >= 75 && r.gapsHigh > 0) {
      items.push({ id: r.id, title: r.title, severity: 'Medium', reason: `Strong match but ${r.gapsHigh} high-severity gap${r.gapsHigh > 1 ? 's' : ''}.`, action: 'View Qualification', to: `/opportunities/${r.id}` });
    }
    if (r.proposal && r.proposalReadiness < 60) {
      items.push({ id: r.id, title: r.title, severity: 'Medium', reason: `Proposal readiness low (${r.proposalReadiness}%).`, action: 'Open Proposal', to: `/proposals/${r.id}` });
    }
    if (r.priority === 'HIGH' && r.status === 'Reviewing') {
      items.push({ id: r.id, title: r.title, severity: 'Low', reason: 'High-priority opportunity still under review.', action: 'Move to Pursuing', to: '/pipeline' });
    }
  });
  const rank = { High: 0, Medium: 1, Low: 2 };
  return items.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

const PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/** The opportunities most worth a reviewer's time right now. */
export function getPriorityOpportunities(rows, limit = 5) {
  return [...rows]
    .filter((r) => r.status !== 'Skipped')
    .sort((a, b) => {
      if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return (b.matchScore ?? -1) - (a.matchScore ?? -1);
    })
    .slice(0, limit);
}
