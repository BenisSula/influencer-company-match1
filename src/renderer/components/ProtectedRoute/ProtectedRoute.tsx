import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // No longer force users to complete profile
  // They can access the platform and update profile from Profile page
  return <>{children}</>;
};
