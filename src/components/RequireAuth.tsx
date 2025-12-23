import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactElement } from 'react';

export function RequireAuth({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const base = (import.meta.env && (import.meta.env.BASE_URL as string)) || '/';

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted url
    return <Navigate to={`${base}login`} state={{ from: location }} replace />;
  }

  return children;
}
