import { Globe, LogOut, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

/** Neutral emblem placeholder - not a reproduction of the State Emblem. */
function EmblemPlaceholder() {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-900/20 bg-white"
      title="National emblem placeholder"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-navy-900" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3v4M8 7h8M9 7v8M12 7v8M15 7v8M6 15h12M7 18h10" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Slim official-portal bar that sits above every authenticated screen,
 * closing with the thin saffron-white-green accent line.
 */
export function GovTopStrip({ compact = false }) {
  const { showToast } = useApp();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();

  function onLanguageChange(e) {
    const code = e.target.value;
    setLanguage(code);
    const lang = supportedLanguages.find((l) => l.code === code);
    showToast(t('toast.languageSet', { lang: lang ? lang.nativeName : code }));
  }

  return (
    <div className="w-full">
      <div className="border-b border-gov-border bg-white">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <EmblemPlaceholder />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-navy-900">
                Government of India
              </div>
              <div className="text-[11px] text-gov-muted">Ministry of Commerce &amp; Industry</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="flex items-center gap-1.5 text-gov-muted">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <label className="sr-only" htmlFor="language-select">Select language</label>
              <select
                id="language-select"
                value={language}
                onChange={onLanguageChange}
                className="cursor-pointer rounded border border-transparent bg-transparent py-1 text-xs font-medium text-navy-900 hover:border-gov-border focus:border-saffron-500 focus:outline-none"
              >
                {supportedLanguages.map((l) => <option key={l.code} value={l.code}>{l.nativeName}</option>)}
              </select>
            </div>

            {compact || !user ? null : (
              <>
                <Link
                  to="/account"
                  className="hidden items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-navy-900 hover:bg-slate-100 sm:flex"
                  title="View your account profile"
                >
                  <UserCircle2 className="h-4 w-4" />
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold text-gov-muted hover:bg-slate-100 hover:text-navy-900"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="tricolour-strip" />
    </div>
  );
}
