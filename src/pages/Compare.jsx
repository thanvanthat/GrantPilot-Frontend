import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';
import { ComparisonSelector } from '@/components/comparison/ComparisonSelector';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { ComparisonSummary } from '@/components/comparison/ComparisonSummary';
import { usePortfolioRows } from '@/hooks/usePortfolio';
import { compareOpportunities } from '@/utils/comparisonEngine';
import { GitCompare } from 'lucide-react';

export default function Compare() {
  const rows = usePortfolioRows();
  const { showToast } = useApp();
  const [selectedIds, setSelectedIds] = useState([]);

  function toggle(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) { showToast('Opportunity removed from comparison.'); return prev.filter((x) => x !== id); }
      if (prev.length >= 4) return prev;
      showToast('Opportunity added to comparison.');
      return [...prev, id];
    });
  }

  const selectedRows = compareOpportunities(rows, selectedIds);
  const ready = selectedRows.length >= 2;

  return (
    <div className="animate-fade-in">
      <SectionHeading title="Compare Opportunities" description="Compare fit, readiness and risk before prioritizing your next opportunity." />

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr] lg:items-start">
        <ComparisonSelector rows={rows} selectedIds={selectedIds} onToggle={toggle} />

        <div className="space-y-5">
          {!ready ? (
            <EmptyState icon={GitCompare} title="Select at least two opportunities to compare" description="Choose 2 to 4 opportunities from the list to see them side by side." />
          ) : (
            <>
              <ComparisonSummary rows={selectedRows} />
              <ComparisonTable rows={selectedRows} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
