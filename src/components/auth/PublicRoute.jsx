import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLoading } from '@/components/auth/AuthLoading';
import { ROUTES } from '@/constants/routes';

/** Login/register pages. An authenticated user is sent straight to the app. */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to={ROUTES.dashboard} replace />;
  return children;
}
