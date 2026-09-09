import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getOpportunity } from '@/data/opportunities';
import { useLanguage } from '@/context/LanguageContext';

// Route segment -> translation key. Business names (opportunity/proposal
// titles) are not translated — only the system labels are.
const SEGMENT_KEYS = {
  dashboard: 'nav.dashboard',
  opportunities: 'nav.opportunities',
  pipeline: 'nav.pipeline',
  compare: 'nav.compare',
  proposals: 'nav.proposals',
  compliance: 'nav.compliance',
  reports: 'nav.reports',
  profile: 'nav.companyProfile',
  account: 'nav.userProfile',
  documents: 'nav.documents',
  settings: 'nav.settings',
};

/** Formal breadcrumb derived from the current route. */
export function Breadcrumb() {
  const { pathname, search } = useLocation();
  const { t } = useLanguage();
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length || segments[0] === 'dashboard') return null;

  const crumbs = [];
  let acc = '';
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    let label = SEGMENT_KEYS[seg] ? t(SEGMENT_KEYS[seg]) : seg;
    // Resolve an opportunity/proposal id to its (untranslated) business title.
    if (i > 0 && (segments[i - 1] === 'opportunities' || segments[i - 1] === 'proposals')) {
      label = getOpportunity(seg)?.title || t(`nav.${segments[i - 1]}`);
    }
    crumbs.push({ to: acc, label, last: i === segments.length - 1 });
  });

  if (segments[0] === 'compliance') {
    const id = new URLSearchParams(search).get('opportunity');
    const o = id && getOpportunity(id);
    if (o) crumbs.push({ to: `${pathname}${search}`, label: o.title, last: true });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-gov-muted">
      <Link to="/dashboard" className="hover:text-navy-900 hover:underline">{t('breadcrumb.home')}</Link>
      {crumbs.map((c) => (
        <span key={c.to} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-slate-400" />
          {c.last
            ? <span className="max-w-[20rem] truncate font-semibold text-navy-900" aria-current="page">{c.label}</span>
            : <Link to={c.to} className="hover:text-navy-900 hover:underline">{c.label}</Link>}
        </span>
      ))}
    </nav>
  );
}
