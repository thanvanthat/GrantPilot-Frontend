import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/** Full-screen loading gate shown while the session is being restored. */
export function AuthLoading({ messageKey = 'auth_loading.checking' }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gov-bg">
      <span className="flex h-11 w-11 items-center justify-center rounded-gov bg-saffron-500 text-lg font-extrabold text-white">G</span>
      <p className="flex items-center gap-2 text-sm font-medium text-gov-muted">
        <Loader2 className="h-4 w-4 animate-spin text-saffron-500" /> {t(messageKey)}
      </p>
    </div>
  );
}
