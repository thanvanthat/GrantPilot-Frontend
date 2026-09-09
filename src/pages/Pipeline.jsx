import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StatCounter } from '@/components/common/StatCounter';
import { EmptyState } from '@/components/common/EmptyState';
import { Input, Select } from '@/components/ui/input';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { usePortfolioRows } from '@/hooks/usePortfolio';
import { getStatusCounts, sortPipelineOpportunities, filterPipelineOpportunities } from '@/utils/pipelineEngine';
import { SECTOR_NAMES } from '@/data/sectors';
import { Target, PlusCircle, Eye, CheckCircle2, XCircle } from 'lucide-react';

const SORTS = {
  priority: 'Priority',
  match: 'Match Score',
  deadline: 'Deadline',
  budget: 'Budget',
  updated: 'Recently Updated',
};

export default function Pipeline() {
  const rows = usePortfolioRows();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('priority');
  const [filters, setFilters] = useState({ status: 'All', sector: 'All', recommendation: 'All', eligibility: 'All', priority: 'All', deadline: 'All' });

  const setF = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const counts = useMemo(() => getStatusCounts(rows), [rows]);
  const visible = useMemo(
    () => sortPipelineOpportunities(filterPipelineOpportunities(rows, { ...filters, query }), sort),
    [rows, filters, query, sort],
  );

  return (
    <div className="animate-fade-in">
      <SectionHeading title="Opportunity Pipeline" description="Track, prioritize and manage your government opportunity portfolio." />

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCounter icon={Target} value={rows.length} label="Total Opportunities" accent="saffron" />
        <StatCounter icon={PlusCircle} value={counts.New} label="New" accent="navy" />
        <StatCounter icon={Eye} value={counts.Reviewing} label="Reviewing" accent="navy" />
        <StatCounter icon={CheckCircle2} value={counts.Pursuing} label="Pursuing" accent="green" />
        <StatCounter icon={XCircle} value={counts.Skipped} label="Skipped" accent="amber" />
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, department, sector or technology" className="pl-9" />
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto min-w-[11rem]" aria-label="Sort">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v}</option>)}
        </Select>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        <Select value={filters.status} onChange={setF('status')} className="w-auto min-w-[9rem]" aria-label="Filter by status">
          {['All', 'New', 'Reviewing', 'Pursuing', 'Skipped'].map((s) => <option key={s} value={s}>Status: {s}</option>)}
        </Select>
        <Select value={filters.sector} onChange={setF('sector')} className="w-auto min-w-[9rem]" aria-label="Filter by sector">
          {['All', ...SECTOR_NAMES].map((s) => <option key={s} value={s}>{s === 'All' ? 'Sector: All' : s}</option>)}
        </Select>
        <Select value={filters.recommendation} onChange={setF('recommendation')} className="w-auto min-w-[10rem]" aria-label="Filter by recommendation">
          {['All', 'PURSUE', 'REVIEW', 'SKIP', 'Not Analyzed'].map((s) => <option key={s} value={s}>Rec: {s}</option>)}
        </Select>
        <Select value={filters.eligibility} onChange={setF('eligibility')} className="w-auto min-w-[9rem]" aria-label="Filter by eligibility">
          {['All', 'PASS', 'PARTIAL', 'FAIL', 'UNKNOWN'].map((s) => <option key={s} value={s}>Elig: {s}</option>)}
        </Select>
        <Select value={filters.priority} onChange={setF('priority')} className="w-auto min-w-[9rem]" aria-label="Filter by priority">
          {['All', 'HIGH', 'MEDIUM', 'LOW'].map((s) => <option key={s} value={s}>Priority: {s}</option>)}
        </Select>
        <Select value={filters.deadline} onChange={setF('deadline')} className="w-auto min-w-[9rem]" aria-label="Filter by deadline">
          {[['All', 'All'], ['DUE_SOON', 'Due soon'], ['UPCOMING', 'Upcoming'], ['PAST', 'Past']].map(([v, l]) => <option key={v} value={v}>Deadline: {l}</option>)}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No opportunities in the pipeline yet" description="Opportunities you match and analyse will appear here." />
      ) : (
        <>
          <p className="mb-3 text-sm text-gov-muted">{visible.length} of {rows.length} shown</p>
          <PipelineBoard rows={visible} />
        </>
      )}
    </div>
  );
}
