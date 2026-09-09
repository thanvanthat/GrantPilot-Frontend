import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, HelpCircle, LogOut, UserCircle2, Globe, Target, FileText, FolderOpen, X, Settings,
} from 'lucide-react';
import { initials } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { usePortfolioRows } from '@/hooks/usePortfolio';
import { getAttentionItems } from '@/utils/reportingEngine';
import { useLanguage } from '@/context/LanguageContext';
import { SeverityBadge } from '@/components/common/StatusPill';
import { cn } from '@/lib/utils';

/** Neutral emblem placeholder — not a reproduction of any official emblem. */
function Emblem() {
  return (
    <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-900/15 bg-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-navy-900" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3v4M8 7h8M9 7v8M12 7v8M15 7v8M6 15h12M7 18h10" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function GlobalSearch({ onNavigate }) {
  const { matches, proposals, documents } = useApp();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const opps = matches
      .filter((o) => `${o.title} ${o.organization} ${o.sector}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((o) => ({ type: 'Opportunity', icon: Target, label: o.title, sub: o.organization, to: `/opportunities/${o.id}` }));
    const props = Object.values(proposals)
      .filter((p) => p.opportunityTitle.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({ type: 'Proposal', icon: FileText, label: p.opportunityTitle, sub: `Proposal · ${p.status}`, to: `/proposals/${p.opportunityId}` }));
    const docs = documents
      .filter((d) => d.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((d) => ({ type: 'Document', icon: FolderOpen, label: d.name, sub: `Document · ${d.type}`, to: '/documents' }));
    return [...opps, ...props, ...docs];
  }, [query, matches, proposals, documents]);

  function go(to) {
    setQuery('');
    setOpen(false);
    onNavigate(to);
  }

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        placeholder={t('header.searchPlaceholder')}
        aria-label={t('header.searchPlaceholder')}
        className="h-9 w-full rounded-gov border border-gov-border bg-gov-bg pl-9 pr-3 text-sm text-gov-ink placeholder:text-slate-400 focus:border-saffron-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500"
      />
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-gov border border-gov-border bg-white shadow-cardHover">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gov-muted">{t('header.noResults', { query })}</p>
          ) : (
            <ul className="max-h-80 divide-y divide-gov-border overflow-y-auto">
              {results.map((r, i) => (
                <li key={`${r.type}-${i}`}>
                  <button type="button" onClick={() => go(r.to)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gov-bg">
                    <r.icon className="h-4 w-4 shrink-0 text-navy-700" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-navy-900">{r.label}</span>
                      <span className="block truncate text-xs text-gov-muted">{r.sub}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-semibold text-navy-900">{t(`header.resultType.${r.type}`)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Notifications({ onNavigate }) {
  const rows = usePortfolioRows();
  const { t } = useLanguage();
  const items = useMemo(() => getAttentionItems(rows), [rows]);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-gov text-gov-muted hover:bg-gov-bg hover:text-navy-900"
        aria-label={`Notifications, ${items.length} needing attention`}
      >
        <Bell className="h-[18px] w-[18px]" />
        {items.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-white">{items.length}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-gov border border-gov-border bg-white shadow-cardHover">
          <div className="flex items-center justify-between border-b border-gov-border px-4 py-2.5">
            <p className="text-sm font-bold text-navy-900">{t('header.attentionRequired')}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('common.close')}><X className="h-4 w-4 text-gov-muted" /></button>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gov-muted">{t('header.nothingAttention')}</p>
          ) : (
            <ul className="max-h-80 divide-y divide-gov-border overflow-y-auto">
              {items.slice(0, 8).map((it, i) => (
                <li key={`${it.id}-${i}`}>
                  <button type="button" onClick={() => { setOpen(false); onNavigate(it.to); }} className="flex w-full items-start gap-2 px-4 py-2.5 text-left hover:bg-gov-bg">
                    <SeverityBadge severity={it.severity} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-navy-900">{it.title}</span>
                      <span className="block text-xs text-gov-muted">{it.reason}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function HelpMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-gov text-gov-muted hover:bg-gov-bg hover:text-navy-900" aria-label={t('utility.help')}>
        <HelpCircle className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-gov border border-gov-border bg-white p-4 shadow-cardHover">
          <p className="mb-2 text-sm font-bold text-navy-900">{t('header.gettingStarted')}</p>
          <ul className="space-y-1.5 text-xs text-gov-ink">
            <li>1. {t('header.step1')}</li>
            <li>2. {t('header.step2')}</li>
            <li>3. {t('header.step3')}</li>
            <li>4. {t('header.step4')}</li>
          </ul>
          <p className="mt-3 border-t border-gov-border pt-2 text-[11px] text-gov-muted">
            {t('header.helpDisclaimer')}
          </p>
        </div>
      )}
    </div>
  );
}

function UserMenu({ user, onNavigate, onSignOut }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const go = (to) => { setOpen(false); onNavigate(to); };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-gov px-1.5 py-1 hover:bg-gov-bg"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron-500 text-xs font-bold text-white">{initials(user.name) || 'GP'}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs font-semibold text-navy-900">{user.name}</span>
          {user.companyName ? <span className="block text-[11px] text-gov-muted">{user.companyName}</span> : null}
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-gov border border-gov-border bg-white py-1 shadow-cardHover">
          <button role="menuitem" type="button" onClick={() => go('/account')} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gov-ink hover:bg-gov-bg"><UserCircle2 className="h-4 w-4" /> {t('nav.profile')}</button>
          <button role="menuitem" type="button" onClick={() => go('/settings')} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gov-ink hover:bg-gov-bg"><Settings className="h-4 w-4" /> {t('nav.settings')}</button>
          <div className="my-1 h-px bg-gov-border" />
          <button role="menuitem" type="button" onClick={onSignOut} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-gov-red hover:bg-gov-redLight"><LogOut className="h-4 w-4" /> {t('common.signOut')}</button>
        </div>
      )}
    </div>
  );
}

/** Formal government-style institutional header. */
export function AppHeader() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();

  function onLanguageChange(e) {
    const code = e.target.value;
    setLanguage(code);
    const lang = supportedLanguages.find((l) => l.code === code);
    showToast(t('toast.languageSet', { lang: lang ? lang.nativeName : code }));
  }

  async function handleSignOut() {
    await signOut();
    showToast(t('toast.signedOut'));
    navigate('/login', { replace: true });
  }

  return (
    <header className="w-full">
      {/* Utility strip */}
      <div className="bg-navy-950 text-white/80">
        <div className="mx-auto flex h-8 max-w-[1600px] items-center justify-between px-4 text-[11px] sm:px-6">
          <span className="font-medium">{t('app.platform')}</span>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 sm:flex">
              <Globe className="h-3 w-3" />
              <label className="sr-only" htmlFor="lang-select">{t('utility.selectLanguage')}</label>
              <select id="lang-select" value={language} onChange={onLanguageChange} className="cursor-pointer bg-transparent text-[11px] text-white focus:outline-none [&>option]:text-navy-900">
                {supportedLanguages.map((l) => <option key={l.code} value={l.code}>{l.nativeName}</option>)}
              </select>
            </span>
            <span className="text-white/30">|</span>
            <a href="#main" className="hover:text-white">{t('utility.accessibility')}</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-gov-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Emblem />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-navy-900">{t('app.tagline')}</div>
              <div className="hidden text-[11px] text-gov-muted sm:block">{t('app.trust')}</div>
            </div>
          </div>

          <div className="hidden flex-1 justify-center md:flex">
            <GlobalSearch onNavigate={navigate} />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Notifications onNavigate={navigate} />
            <HelpMenu />
            {user && (
              <>
                <span className="mx-1 hidden h-6 w-px bg-gov-border sm:block" />
                <UserMenu user={user} onNavigate={navigate} onSignOut={handleSignOut} />
              </>
            )}
          </div>
        </div>
        {/* Mobile search */}
        <div className="border-t border-gov-border px-4 py-2 md:hidden">
          <GlobalSearch onNavigate={navigate} />
        </div>
      </div>
      <div className="tricolour-strip" />
    </header>
  );
}
