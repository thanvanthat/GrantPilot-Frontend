import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Loader2, Building2, CalendarClock, IndianRupee, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { SectionHeading } from '@/components/common/SectionHeading';
import { SectorBadge } from '@/components/common/SectorBadge';
import { StatusPill } from '@/components/common/StatusPill';
import { RecommendationBadge } from '@/components/common/RecommendationBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { OpportunityStatusBadge } from '@/components/opportunities/OpportunityStatusControl';
import { findMatches } from '@/services/snsWorkbench';
import { cn } from '@/lib/utils';

// Sort helpers. `qual` maps opportunityId -> qualification result.
function makeSorts(qual) {
  const scoreOf = (o) => (qual[o.id] ? qual[o.id].overallScore : -1); // unanalysed sort last
  return {
    relevance: { label: 'Relevance', fn: (a, b) => b.matchScore - a.matchScore },
    match: { label: 'Match Score', fn: (a, b) => scoreOf(b) - scoreOf(a) },
    deadline: { label: 'Deadline (soonest)', fn: (a, b) => a.deadline - b.deadline },
    budget: { label: 'Budget', fn: (a, b) => budgetValue(b.budget) - budgetValue(a.budget) },
  };
}

/** Rough numeric value of an Indian budget string for sorting (Cr > L). */
function budgetValue(budget = '') {
  const num = parseFloat(budget.replace(/[^\d.]/g, '')) || 0;
  return /cr/i.test(budget) ? num * 100 : num; // normalise to lakhs
}

const STATUS_OPTIONS = ['All', 'New', 'Reviewing', 'Pursuing', 'Skipped'];
const REC_OPTIONS = ['All', 'PURSUE', 'REVIEW', 'SKIP', 'Not Analyzed'];

export default function Opportunities() {
  const navigate = useNavigate();
  const {
    profile, matches, setMatches, lastMatchRun, setLastMatchRun,
    getOpportunityStatus, qualifications,
  } = useApp();

  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [recFilter, setRecFilter] = useState('All');
  const [sort, setSort] = useState('relevance');
  const [running, setRunning] = useState(false);

  const SORTS = useMemo(() => makeSorts(qualifications), [qualifications]);

  const sectorsPresent = useMemo(
    () => ['All', ...Array.from(new Set(matches.map((o) => o.sector)))],
    [matches],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matches
      .filter((o) => (sector === 'All' ? true : o.sector === sector))
      .filter((o) => (statusFilter === 'All' ? true : getOpportunityStatus(o.id) === statusFilter))
      .filter((o) => {
        if (recFilter === 'All') return true;
        const rec = qualifications[o.id]?.recommendation;
        if (recFilter === 'Not Analyzed') return !rec;
        return rec === recFilter;
      })
      .filter((o) =>
        !q
          ? true
          : o.title.toLowerCase().includes(q) ||
            o.organization.toLowerCase().includes(q) ||
            o.sector.toLowerCase().includes(q) ||
            (o.technicalRequirements || []).join(' ').toLowerCase().includes(q),
      )
      .sort(SORTS[sort].fn);
  }, [matches, query, sector, statusFilter, recFilter, sort, SORTS, getOpportunityStatus, qualifications]);

  async function runMatching() {
    setRunning(true);
    // React Page -> Service -> snsWorkbench (mock now, SNS Workbench later)
    const ranked = await findMatches(profile, matches);
    setMatches(ranked);
    setLastMatchRun(new Date().toISOString());
    setRunning(false);
  }

  return (
    <div className="animate-fade-in">
      <SectionHeading
        title="AI Opportunity Matching"
        description="Government opportunities ranked against your company profile. Run qualification on any opportunity to score its fit."
        action={
          <Button onClick={runMatching} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {running ? 'Matching…' : 'Find Matching Opportunities'}
          </Button>
        }
      />

      {lastMatchRun && (
        <p className="mb-4 text-xs text-gov-muted">Last matched {new Date(lastMatchRun).toLocaleString('en-IN')}</p>
      )}

      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, organisation, sector or technology" className="pl-9" />
        </div>
        <Select value={recFilter} onChange={(e) => setRecFilter(e.target.value)} className="w-auto min-w-[12rem]" aria-label="Filter by recommendation">
          {REC_OPTIONS.map((r) => <option key={r} value={r}>Recommendation: {r}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[10rem]" aria-label="Filter by status">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>Status: {s}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto min-w-[12rem]" aria-label="Sort opportunities">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v.label}</option>)}
        </Select>
      </div>

      {/* Sector filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sectorsPresent.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              sector === s
                ? 'border-saffron-500 bg-saffron-500 text-white'
                : 'border-gov-border bg-white text-gov-muted hover:border-saffron-400 hover:text-saffron-600',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm text-gov-muted">{visible.length} opportunit{visible.length === 1 ? 'y' : 'ies'}</p>

      {visible.length === 0 ? (
        <EmptyState title="No opportunities found" description="No opportunities match your current search, sector, status or recommendation filters." />
      ) : (
        <div className="grid gap-3">
          {visible.map((o) => {
            const q = qualifications[o.id];
            return (
              <Card key={o.id} className="cursor-pointer transition-shadow hover:shadow-cardHover" onClick={() => navigate(`/opportunities/${o.id}`)}>
                <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  {/* Main */}
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <SectorBadge sector={o.sector} />
                      <span className="rounded-full border border-gov-border px-2 py-0.5 text-[11px] font-medium text-gov-muted">{o.type}</span>
                      <OpportunityStatusBadge status={getOpportunityStatus(o.id)} />
                    </div>
                    <h3 className="text-sm font-bold text-navy-900">{o.title}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gov-muted">
                      <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{o.organization}</span>
                      <span className="inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{o.budget}</span>
                      <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{o.deadline} days left</span>
                    </div>
                  </div>

                  {/* Qualification summary */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-end">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gov-muted">Match</p>
                      {q ? <p className="text-lg font-extrabold text-navy-900">{q.overallScore}%</p>
                         : <p className="text-xs font-medium text-slate-400">Not analyzed</p>}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gov-muted">Eligibility</p>
                      {q ? <StatusPill status={q.eligibilityStatus} /> : <span className="text-xs text-slate-400">—</span>}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gov-muted">Recommendation</p>
                      {q ? <RecommendationBadge recommendation={q.recommendation} /> : <span className="text-xs text-slate-400">—</span>}
                    </div>
                    <ArrowRight className="hidden h-5 w-5 shrink-0 text-slate-300 lg:block" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
