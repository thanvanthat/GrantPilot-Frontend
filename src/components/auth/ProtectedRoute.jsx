import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLoading } from '@/components/auth/AuthLoading';
import { ROUTES } from '@/constants/routes';

/**
 * Gate for authenticated routes. Waits for session initialization before
 * deciding, so a transient null user never bounces the user to login.
 * On redirect it remembers the intended location for post-login return.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading messageKey="auth_loading.workspace" />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return children;
}
