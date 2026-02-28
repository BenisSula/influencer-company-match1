import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminAuthService } from '../../services/admin-auth.service';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');
      
      console.log('AdminProtectedRoute - Checking auth');
      console.log('AdminProtectedRoute - Token:', token ? 'Present' : 'Missing');
      console.log('AdminProtectedRoute - Admin User:', adminUser ? 'Present' : 'Missing');
      
      if (token && adminUser) {
        try {
          const user = JSON.parse(adminUser);
          if (user && user.id) {
            console.log('AdminProtectedRoute - Auth valid, user:', user.email);
            setIsAuthenticated(true);
          } else {
            console.log('AdminProtectedRoute - Invalid user data');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('AdminProtectedRoute - Error parsing admin user:', error);
          // Invalid JSON in localStorage - clear it and treat as not authenticated
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setIsAuthenticated(false);
        }
      } else {
        console.log('AdminProtectedRoute - No auth credentials found');
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('AdminProtectedRoute - Redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
