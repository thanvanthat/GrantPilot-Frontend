// Side-by-side comparison metrics over enriched portfolio rows.
// Describes the strongest signals; never declares a "winner".

function best(rows, valueOf) {
  let winner = null;
  let bestVal = -Infinity;
  rows.forEach((r) => {
    const v = valueOf(r);
    if (v !== null && v !== undefined && v > bestVal) { bestVal = v; winner = r; }
  });
  return winner ? { row: winner, value: bestVal } : null;
}

export function getHighestMatch(rows) {
  return best(rows, (r) => (r.analyzed ? r.matchScore : null));
}

export function getHighestProposalReadiness(rows) {
  return best(rows, (r) => (r.proposal ? r.proposalReadiness : null));
}

export function getHighestComplianceReadiness(rows) {
  return best(rows, (r) => (r.compliance ? r.complianceReadiness : null));
}

/** Lowest open-risk count among analysed opportunities (compliance risks). */
export function getLowestRisk(rows) {
  const analysed = rows.filter((r) => r.compliance);
  if (!analysed.length) return null;
  const winner = analysed.reduce((min, r) => (r.openRisks < min.openRisks ? r : min), analysed[0]);
  return { row: winner, value: winner.openRisks };
}

const ELIG_RANK = { PASS: 0, PARTIAL: 1, UNKNOWN: 2, FAIL: 3 };
export function getBestEligibility(rows) {
  const analysed = rows.filter((r) => r.analyzed);
  if (!analysed.length) return null;
  const winner = analysed.reduce((b, r) => (ELIG_RANK[r.eligibility] < ELIG_RANK[b.eligibility] ? r : b), analysed[0]);
  return { row: winner, value: winner.eligibility };
}

export function getComparisonMetrics(rows) {
  return {
    highestMatch: getHighestMatch(rows),
    bestEligibility: getBestEligibility(rows),
    lowestRisk: getLowestRisk(rows),
    highestProposalReadiness: getHighestProposalReadiness(rows),
    highestComplianceReadiness: getHighestComplianceReadiness(rows),
  };
}

/** Rows for the selected ids, in selection order. */
export function compareOpportunities(allRows, selectedIds) {
  return selectedIds.map((id) => allRows.find((r) => r.id === id)).filter(Boolean);
}
