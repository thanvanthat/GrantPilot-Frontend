import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '@/services/authService';

const AuthContext = createContext(null);

/**
 * Authentication state — kept separate from GrantPilotContext (application
 * data). This provider lives ABOVE the Router, so auth state is created once
 * and never reset by route changes. It answers only: "who is signed in?".
 *
 * @typedef {{ id:string, name:string, email:string, companyName?:string, role?:string }} AuthUser
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until the session is restored
  const [error, setError] = useState('');

  // Restore any existing demo session before protected routes render.
  useEffect(() => {
    const restored = authService.restoreSession();
    if (restored) setUser(restored);
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email, password) => {
    setError('');
    const res = await authService.signIn(email, password);
    if (res.ok) setUser(res.user);
    else setError(res.error);
    return res;
  }, []);

  const register = useCallback(async (details) => {
    setError('');
    const res = await authService.register(details);
    if (res.ok) setUser(res.user);
    else setError(res.error);
    return res;
  }, []);

  const signInWithGoogle = useCallback(async (email) => {
    setError('');
    const res = await authService.signInWithGoogle(email);
    if (res.ok) setUser(res.user);
    return res;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      signIn,
      register,
      signInWithGoogle,
      signOut,
    }),
    [user, isLoading, error, signIn, register, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
