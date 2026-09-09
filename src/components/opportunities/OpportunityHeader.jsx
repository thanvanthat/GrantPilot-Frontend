import { Building2, IndianRupee, CalendarClock, MapPin } from 'lucide-react';
import { SectorBadge } from '@/components/common/SectorBadge';
import { OpportunityStatusBadge } from '@/components/opportunities/OpportunityStatusControl';

/** Opportunity summary header used at the top of the qualification workspace. */
export function OpportunityHeader({ opportunity, status }) {
  return (
    <div className="overflow-hidden rounded-gov border border-gov-border bg-white shadow-card">
      <div className="tricolour-strip" />
      <div className="p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <SectorBadge sector={opportunity.sector} />
          <span className="rounded-full border border-gov-border px-2.5 py-0.5 text-xs font-medium text-gov-muted">{opportunity.type}</span>
          {status ? <OpportunityStatusBadge status={status} /> : null}
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">{opportunity.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gov-muted">
          <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" />{opportunity.organization}</span>
          <span className="inline-flex items-center gap-1.5"><IndianRupee className="h-4 w-4" />{opportunity.budget}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-4 w-4" />{opportunity.deadline} days left</span>
          {opportunity.location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{opportunity.location}</span> : null}
        </div>
      </div>
    </div>
  );
}
