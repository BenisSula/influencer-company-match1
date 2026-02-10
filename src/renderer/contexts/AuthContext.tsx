import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse, UserProfile } from '../services/auth.service';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'INFLUENCER' | 'COMPANY') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login({ email, password });
      localStorage.setItem('auth_token', response.access_token);
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: 'INFLUENCER' | 'COMPANY') => {
    try {
      const response: AuthResponse = await authService.register({ email, password, role });
      localStorage.setItem('auth_token', response.access_token);
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
