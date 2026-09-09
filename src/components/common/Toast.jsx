import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

/** Single transient toast, driven by context. Auto-dismisses after 2.5s. */
export function Toast() {
  const { toast, dismissToast } = useApp();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(dismissToast, 2500);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2" role="status" aria-live="polite">
      <div className="flex items-center gap-2.5 rounded-gov border border-navy-900/10 bg-navy-900 px-4 py-2.5 text-sm font-medium text-white shadow-cardHover">
        <CheckCircle2 className="h-4 w-4 text-saffron-400" />
        {toast.message}
        <button type="button" onClick={dismissToast} aria-label="Dismiss" className="ml-1 text-white/60 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
