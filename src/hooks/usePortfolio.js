import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { buildPortfolioRows } from '@/utils/pipelineEngine';

/** Enriched portfolio rows (one per opportunity) from shared context. */
export function usePortfolioRows() {
  const { matches, opportunityStatuses, qualifications, proposals, complianceResults } = useApp();
  return useMemo(
    () => buildPortfolioRows({ matches, statuses: opportunityStatuses, qualifications, proposals, complianceResults }),
    [matches, opportunityStatuses, qualifications, proposals, complianceResults],
  );
}
