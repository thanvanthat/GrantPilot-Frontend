import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FolderOpen, Target, FileText, ClipboardCheck,
  KanbanSquare, GitCompare, BarChart3, Settings,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn, initials } from '@/lib/utils';

const NAV_GROUPS = [
  { titleKey: 'nav.groupOverview', items: [{ to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard }] },
  {
    titleKey: 'nav.groupOpportunityIntelligence',
    items: [
      { to: '/opportunities', labelKey: 'nav.opportunities', icon: Target },
      { to: '/pipeline', labelKey: 'nav.pipeline', icon: KanbanSquare },
      { to: '/compare', labelKey: 'nav.compare', icon: GitCompare },
    ],
  },
  {
    titleKey: 'nav.groupExecution',
    items: [
      { to: '/proposals', labelKey: 'nav.proposals', icon: FileText },
      { to: '/compliance', labelKey: 'nav.compliance', icon: ClipboardCheck },
    ],
  },
  { titleKey: 'nav.groupInsights', items: [{ to: '/reports', labelKey: 'nav.reports', icon: BarChart3 }] },
  {
    titleKey: 'nav.groupAccount',
    items: [
      { to: '/profile', labelKey: 'nav.profile', icon: Building2 },
      { to: '/documents', labelKey: 'nav.documents', icon: FolderOpen },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { profile } = useApp();
  const { t } = useLanguage();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy-900 text-white">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-gov bg-saffron-500 text-base font-extrabold text-white">
            G
          </span>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">GrantPilot</div>
            <div className="text-[11px] font-medium text-white/60">{t('nav.brandSubtitle')}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.titleKey} className="mb-3">
            <p className="px-5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{t(group.titleKey)}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, labelKey, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 border-l-4 px-5 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-saffron-500 bg-white/10 font-semibold text-white'
                          : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    {t(labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Company badge — opens the Company Profile */}
      <div className="border-t border-white/10 p-4">
        <NavLink
          to="/profile"
          title="Open company profile"
          className={({ isActive }) =>
            cn(
              'flex w-full items-center gap-3 rounded-gov p-3 text-left transition-colors',
              isActive ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10',
            )
          }
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron-500 text-xs font-bold text-white">
            {initials(profile.companyName) || 'GP'}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-white">{profile.companyName || 'Set up profile'}</div>
            <div className="truncate text-[11px] text-white/60">
              {profile.sector ? `${profile.sector}${profile.stage ? ` · ${profile.stage}` : ''}` : 'Complete your company profile'}
            </div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
