// ---------------------------------------------------------------------------
// Frontend / demo authentication adapter.
//
// This is a DEMO session adapter, NOT production-grade security. It verifies
// credentials against an in-memory account store and keeps the signed-in user
// in sessionStorage (per-tab, cleared when the tab closes) so the session
// survives a page refresh during the demo. No passwords, tokens or secrets are
// ever stored in the session. The function signatures are shaped so a real
// backend / SNS / OAuth provider can replace this module later without
// changing the AuthContext or pages.
// ---------------------------------------------------------------------------

const SESSION_KEY = 'grantpilot.session';
const DEMO_PASSWORD = 'Aeroview@2026';

/** Demo accounts. The personal and company accounts share the same password. */
const seedAccounts = () => ({
  'founder@aeroview.in': { email: 'founder@aeroview.in', password: DEMO_PASSWORD, name: 'Aeroview Founder', companyName: 'Aeroview Systems', role: 'Founder', provider: 'password', type: 'personal', demo: true },
  'contact@aeroview.in': { email: 'contact@aeroview.in', password: DEMO_PASSWORD, name: 'Aeroview Systems', companyName: 'Aeroview Systems', role: 'Company', provider: 'password', type: 'company', demo: true },
});

// In-memory account store (resets when the tab reloads — demo only).
let accounts = seedAccounts();

export const DEMO_LOGIN = { email: 'founder@aeroview.in', password: DEMO_PASSWORD, companyEmail: 'contact@aeroview.in' };

/** Strip secrets — only a safe user object is ever exposed or persisted. */
function toUser(account) {
  return {
    id: account.email,
    name: account.name,
    email: account.email,
    companyName: account.companyName || '',
    role: account.role || 'Member',
    provider: account.provider,
    type: account.type,
    demo: Boolean(account.demo),
  };
}

function persist(user) {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sessionStorage may be unavailable (private mode); session stays in memory only. */
  }
}

/** Verify credentials. Returns a safe user or a friendly error. */
export async function signIn(email, password) {
  const key = (email || '').trim().toLowerCase();
  const account = accounts[key];
  if (!account) return { ok: false, error: 'Unable to sign in. Please check your credentials.' };
  if (account.provider === 'google') return { ok: false, error: 'This email is registered with Google. Use "Continue with Google".' };
  if (account.password !== password) return { ok: false, error: 'Unable to sign in. Please check your credentials.' };
  const user = toUser(account);
  persist(user);
  return { ok: true, user };
}

/** Create a personal account (+ optional company account sharing the password). */
export async function register({ fullName, email, password, companyName, companyEmail, role }) {
  const key = (email || '').trim().toLowerCase();
  if (accounts[key]) return { ok: false, error: 'An account with this email already exists. Please sign in.' };
  accounts[key] = { email: email.trim(), password, name: fullName.trim(), companyName: companyName?.trim() || '', role: role?.trim() || 'Founder', provider: 'password', type: 'personal', demo: false };
  const companyKey = (companyEmail || '').trim().toLowerCase();
  if (companyKey && !accounts[companyKey]) {
    accounts[companyKey] = { email: companyEmail.trim(), password, name: companyName?.trim() || 'Company Account', companyName: companyName?.trim() || '', role: 'Company', provider: 'password', type: 'company', demo: false };
  }
  const user = toUser(accounts[key]);
  persist(user);
  return { ok: true, user, fresh: true };
}

/** Mock Google sign-in (no real OAuth). */
export async function signInWithGoogle(email) {
  const clean = (email || '').trim().toLowerCase();
  const finalEmail = clean && clean.endsWith('@gmail.com') ? clean : 'demo.user@gmail.com';
  const existing = accounts[finalEmail];
  if (!existing) {
    accounts[finalEmail] = { email: finalEmail, password: null, name: finalEmail.split('@')[0], companyName: '', role: 'Founder', provider: 'google', type: 'personal', demo: false };
  }
  const user = toUser(accounts[finalEmail]);
  persist(user);
  return { ok: true, user, fresh: !existing };
}

export async function signOut() {
  persist(null);
  return { ok: true };
}

/** Restore the demo session from sessionStorage (per-tab). */
export function restoreSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  return restoreSession();
}
