import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supportedLanguages, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, isSupported } from '@/i18n/config';
import { translate } from '@/i18n/i18n';

const LanguageContext = createContext(null);

/**
 * Application-wide language state + translation function. This is the ONLY
 * source of language truth — no page keeps its own language state. Changing
 * the language re-renders consumers in place; it never navigates, resets app
 * data, or affects authentication.
 */
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
      return saved && isSupported(saved) ? saved : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });

  const setLanguage = useCallback((code) => {
    if (!isSupported(code)) return;
    setLanguageState(code);
  }, []);

  // Persist per-tab (documented frontend demo session; independent of auth/theme).
  useEffect(() => {
    try { sessionStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* ignore */ }
    // Keep the document lang attribute in sync for accessibility.
    if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = useCallback((key, vars) => translate(language, key, vars), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, supportedLanguages, t }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
