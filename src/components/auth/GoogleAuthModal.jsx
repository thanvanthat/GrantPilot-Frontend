import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

/** Google "G" mark. */
function GoogleIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const inputCls = 'h-12 w-full rounded border border-[#dadce0] px-3.5 text-[15px] text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]';
const blueBtn = 'rounded-full bg-[#1a73e8] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1765cc] disabled:opacity-60';
const textBtn = 'rounded px-3 py-2 text-sm font-semibold text-[#1a73e8] hover:bg-[#1a73e8]/5';

/**
 * Mock Google authentication dialog. It does NOT auto-login: the viewer must
 * enter a Google (gmail) address and a password, then a short "signing in"
 * step runs before `onAuthenticated(email)` fires. Frontend mock only —
 * no real OAuth or credential verification happens.
 */
export function GoogleAuthModal({ open, onClose, onAuthenticated, prefillEmail = '' }) {
  const [step, setStep] = useState('email'); // email | password | loading
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset each time the dialog opens.
  useEffect(() => {
    if (open) {
      setStep('email');
      setEmail(prefillEmail && prefillEmail.endsWith('@gmail.com') ? prefillEmail : '');
      setPassword('');
      setError('');
    }
  }, [open, prefillEmail]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function next() {
    const clean = email.trim().toLowerCase();
    if (!/^\S+@gmail\.com$/.test(clean)) {
      setError('Enter a valid Google Account email (must end with @gmail.com).');
      return;
    }
    setError('');
    setStep('password');
  }

  function signIn() {
    if (!password) { setError('Enter your password.'); return; }
    setError('');
    setStep('loading');
    // Simulate the Google auth round-trip, then authenticate.
    setTimeout(() => {
      onAuthenticated(email.trim().toLowerCase());
    }, 1100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in with Google"
        className="relative w-full max-w-md rounded-lg border border-[#dadce0] bg-white p-8 font-sans text-[#202124] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Cancel" className="absolute right-3 top-3 rounded p-1 text-[#5f6368] hover:bg-black/5">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex flex-col items-center text-center">
          <GoogleIcon className="mb-3 h-8 w-8" />
          {step === 'email' && (
            <>
              <h2 className="text-2xl font-normal">Sign in</h2>
              <p className="mt-1 text-[15px] text-[#5f6368]">Use your Google Account to continue to GrantPilot</p>
            </>
          )}
          {step !== 'email' && (
            <>
              <h2 className="text-2xl font-normal">Welcome</h2>
              <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#dadce0] px-3 py-1 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a73e8] text-[11px] font-bold text-white">
                  {(email[0] || 'G').toUpperCase()}
                </span>
                {email}
              </span>
            </>
          )}
        </div>

        {step === 'email' && (
          <div className="space-y-4">
            <input
              className={inputCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') next(); }}
              placeholder="Email (yourname@gmail.com)"
              autoFocus
            />
            {error && <p className="text-sm text-[#d93025]">{error}</p>}
            <p className="text-[13px] text-[#5f6368]">This is a demo Google sign-in. No real Google account is used or verified.</p>
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={onClose} className={textBtn}>Cancel</button>
              <button type="button" onClick={next} className={blueBtn}>Next</button>
            </div>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-4">
            <input
              className={inputCls}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') signIn(); }}
              placeholder="Enter your password"
              autoFocus
            />
            {error && <p className="text-sm text-[#d93025]">{error}</p>}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => { setStep('email'); setError(''); }} className={textBtn}>Back</button>
              <button type="button" onClick={signIn} className={blueBtn}>Sign in</button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#1a73e8]" />
            <p className="text-sm text-[#5f6368]">Signing in…</p>
          </div>
        )}
      </div>
    </div>
  );
}
