import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse, UserProfile } from '../services/auth.service';
import { messagingService } from '../services/messaging.service';
import { mediaService } from '../services/media.service';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: 'INFLUENCER' | 'COMPANY',
    fullName: string,
    additionalFields?: {
      niche?: string;
      primaryPlatform?: string;
      audienceSizeRange?: string;
      industry?: string;
      companySize?: string;
      budgetRange?: string;
      location?: string;
    }
  ) => Promise<void>;
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
          // ✅ Set token in media service on app load
          mediaService.setToken(token);
          
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch (error: any) {
        console.error('Failed to load user profile:', error);
        // Only remove token if it's actually invalid (401 Unauthorized)
        // Don't remove on network errors or other issues
        if (error.status === 401 || error.message?.includes('401') || error.message?.toLowerCase().includes('unauthorized')) {
          console.log('Token is invalid, clearing auth');
          localStorage.removeItem('auth_token');
          mediaService.setToken(''); // Clear media service token too
          setUser(null);
        } else {
          console.log('Profile load failed but token may still be valid, keeping user logged in');
          // Still set user as null since we couldn't verify, but don't clear token
          // This allows the app to be usable
          setUser(null);
        }
      } finally {
        // ALWAYS set loading to false, even on error
        // This prevents infinite loading states
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login({ email, password });
      localStorage.setItem('auth_token', response.token); // Fixed: use 'token' not 'access_token'
      
      // ✅ Set token in media service after login
      mediaService.setToken(response.token);
      
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    role: 'INFLUENCER' | 'COMPANY',
    fullName: string,
    additionalFields?: {
      niche?: string;
      primaryPlatform?: string;
      audienceSizeRange?: string;
      industry?: string;
      companySize?: string;
      budgetRange?: string;
      location?: string;
    }
  ) => {
    try {
      const response: AuthResponse = await authService.register({
        email,
        password,
        role,
        name: fullName,
        ...additionalFields,
      });
      localStorage.setItem('auth_token', response.token); // Fixed: use 'token' not 'access_token'
      
      // ✅ Set token in media service after registration
      mediaService.setToken(response.token);
      
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
    messagingService.disconnect();
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
