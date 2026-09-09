import { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Wand2, Check, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { GovTopStrip } from '@/components/layout/GovTopStrip';
import { GoogleAuthModal } from '@/components/auth/GoogleAuthModal';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { DEMO_LOGIN } from '@/services/authService';
import { safeRedirect, ROUTES } from '@/constants/routes';
import {
  passwordChecks, isValidPassword, passwordStrength, generateStrongPassword,
} from '@/lib/password';
import { cn } from '@/lib/utils';

/** Brand-neutral Google mark (lucide has no brand icon). */
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

/** Password field with a show/hide toggle. */
function PasswordField({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gov-muted hover:text-navy-900"
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function StrengthMeter({ password, t }) {
  const strength = passwordStrength(password);
  const checks = passwordChecks(password);
  const barTone = { red: 'bg-gov-red', amber: 'bg-gov-amber', green: 'bg-gov-green' }[strength.tone];
  const textTone = { red: 'text-gov-red', amber: 'text-gov-amber', green: 'text-gov-green' }[strength.tone];

  const rule = (ok, label, recommended) => (
    <span className={cn('inline-flex items-center gap-1', ok ? 'text-gov-green' : recommended ? 'text-gov-muted' : 'text-gov-muted')}>
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{label}
    </span>
  );

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full', i < strength.score ? barTone : 'bg-slate-200')} />
        ))}
      </div>
      <p className={cn('mt-1 text-xs font-semibold', textTone)}>{t('auth.strength', { label: strength.label })}</p>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
        {rule(checks.length, '8+ characters')}
        {rule(checks.letter, 'Letters')}
        {rule(checks.number, 'Numbers')}
        {rule(checks.special, 'Special character', true)}
      </div>
    </div>
  );
}

/** Shared login / register screen. `mode` is either 'login' or 'register'. */
export default function Auth({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, register, signInWithGoogle } = useAuth();
  const { loadDemoWorkspace, resetWorkspaceBlank } = useApp();
  const { t } = useLanguage();

  const [form, setForm] = useState({ fullName: '', email: '', companyEmail: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);

  // Where to go after a successful sign-in (set by ProtectedRoute on redirect).
  const dest = safeRedirect(location.state?.from, ROUTES.dashboard);

  const set = (key) => (e) => { setForm((prev) => ({ ...prev, [key]: e.target.value })); setError(''); };
  const setPassword = (val) => setForm((prev) => ({ ...prev, password: val, confirmPassword: val }));

  const emailOk = useMemo(() => /^\S+@\S+\.\S+$/.test(form.email.trim()), [form.email]);

  function suggestPassword() {
    setPassword(generateStrongPassword());
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (submitting) return;

    if (isRegister) {
      if (!form.fullName.trim()) { setError(t('auth.errName')); return; }
      if (!emailOk) { setError(t('auth.errInvalidEmail')); return; }
      if (!isValidPassword(form.password)) { setError(t('auth.errPassword')); return; }
      if (form.password !== form.confirmPassword) { setError(t('auth.errMismatch')); return; }
      if (form.companyEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.companyEmail.trim())) { setError(t('auth.errInvalidEmail')); return; }
      setSubmitting(true);
      const result = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        companyEmail: form.companyEmail.trim(),
        companyName: form.fullName.trim(),
      });
      setSubmitting(false);
      if (!result.ok) { setError(result.error); return; }
      resetWorkspaceBlank(); // a new account starts with an empty company workspace
    } else {
      if (!form.email.trim() || !form.password) { setError(t('auth.errCredentials')); return; }
      setSubmitting(true);
      const result = await signIn(form.email.trim(), form.password);
      setSubmitting(false);
      if (!result.ok) { setError(result.error); return; }
      if (result.user?.demo) loadDemoWorkspace(); // demo account restores the Aeroview showcase
    }
    navigate(dest, { replace: true });
  }

  function openGoogle() {
    setError('');
    setGoogleOpen(true);
  }

  async function handleGoogleAuthenticated(email) {
    setGoogleOpen(false);
    const result = await signInWithGoogle(email);
    if (result.fresh) resetWorkspaceBlank();
    navigate(dest, { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-gov-bg">
      <GovTopStrip compact />

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Brand */}
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-gov bg-saffron-500 text-xl font-extrabold text-white">G</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">GrantPilot</h1>
            <p className="mt-1 text-sm text-gov-muted">Government Opportunity Intelligence &amp; Qualification</p>
          </div>

          <div className="overflow-hidden rounded-gov border border-gov-border bg-white shadow-card">
            <div className="tricolour-strip" />
            <div className="p-6 sm:p-7">
              <h2 className="text-lg font-bold text-navy-900">
                {isRegister ? t('auth.registerTitle') : t('auth.signInTitle')}
              </h2>
              <p className="mt-1 text-sm text-gov-muted">
                {isRegister ? t('auth.registerSubtitle') : t('auth.signInSubtitle')}
              </p>

              {/* Google sign-in */}
              <button
                type="button"
                onClick={openGoogle}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-gov border border-gov-border bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-gov-bg"
              >
                <GoogleIcon className="h-4 w-4" />
                {t('auth.continueWithGoogle')}
              </button>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-gov-border" />
                <span className="text-xs font-medium text-gov-muted">{t('auth.orUseEmail')}</span>
                <span className="h-px flex-1 bg-gov-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {isRegister && (
                  <div>
                    <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                    <Input id="fullName" value={form.fullName} onChange={set('fullName')} placeholder={t('auth.fullNamePlaceholder')} autoComplete="name" />
                  </div>
                )}

                <div>
                  <Label htmlFor="email">{isRegister ? t('auth.personalEmail') : t('auth.email')}</Label>
                  <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.in" autoComplete="email" />
                </div>

                {isRegister && (
                  <div>
                    <Label htmlFor="companyEmail">{t('auth.companyEmail')}</Label>
                    <Input id="companyEmail" type="email" value={form.companyEmail} onChange={set('companyEmail')} placeholder="team@company.in" autoComplete="email" />
                    <p className="mt-1 text-xs text-gov-muted">{t('auth.companyEmailNote')}</p>
                  </div>
                )}

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label htmlFor="password" className="mb-0">{t('auth.password')}</Label>
                    {isRegister && (
                      <button type="button" onClick={suggestPassword} className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-600 hover:underline">
                        <Wand2 className="h-3.5 w-3.5" /> {t('auth.suggestPassword')}
                      </button>
                    )}
                  </div>
                  <PasswordField
                    id="password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder={isRegister ? t('auth.passwordPlaceholderRegister') : t('auth.passwordPlaceholderLogin')}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  {isRegister && <StrengthMeter password={form.password} t={t} />}
                </div>

                {isRegister && (
                  <div>
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <PasswordField
                      id="confirmPassword"
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      placeholder={t('auth.confirmPassword')}
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {error && (
                  <p role="alert" className="rounded-gov border border-gov-red/30 bg-gov-redLight px-3 py-2 text-sm font-medium text-gov-red">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting
                    ? (isRegister ? t('auth.creatingAccount') : t('auth.signingIn'))
                    : (isRegister ? t('auth.createAccount') : t('auth.signInBtn'))}
                </Button>
              </form>

              {!isRegister && (
                <div className="mt-4 flex items-start gap-1.5 rounded-gov border border-navy-100 bg-navy-50 px-3 py-2 text-xs text-navy-900">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{t('auth.demoHint', { email: DEMO_LOGIN.email, password: DEMO_LOGIN.password, companyEmail: DEMO_LOGIN.companyEmail })}</span>
                </div>
              )}

              <p className="mt-5 text-center text-sm text-gov-muted">
                {isRegister ? t('auth.alreadyRegistered') : t('auth.newTo')}
                <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-saffron-600 underline-offset-2 hover:underline">
                  {isRegister ? t('auth.signInBtn') : t('auth.createOne')}
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gov-muted">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('auth.footerTrust')}
          </p>
        </div>
      </div>

      <GoogleAuthModal
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onAuthenticated={handleGoogleAuthenticated}
        prefillEmail={form.email.trim()}
      />
    </div>
  );
}
