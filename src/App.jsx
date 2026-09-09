import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { AuthLoading } from '@/components/auth/AuthLoading';
import { ROUTES } from '@/constants/routes';

import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import UserProfile from '@/pages/UserProfile';
import Documents from '@/pages/Documents';
import Opportunities from '@/pages/Opportunities';
import OpportunityDetail from '@/pages/OpportunityDetail';
import Proposals from '@/pages/Proposals';
import Compliance from '@/pages/Compliance';
import Pipeline from '@/pages/Pipeline';
import Compare from '@/pages/Compare';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Auth mode="login" /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Auth mode="register" /></PublicRoute>} />

      {/* Authenticated application shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<UserProfile />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/proposals/:id" element={<Proposals />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Root: decide once, after auth has initialized. */}
      <Route
        path="/"
        element={
          isLoading
            ? <AuthLoading />
            : <Navigate to={isAuthenticated ? ROUTES.dashboard : ROUTES.login} replace />
        }
      />
    </Routes>
  );
}
