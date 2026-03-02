import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLeftPanel } from '../components/AuthLeftPanel/AuthLeftPanel';
import { AuthRightPanel } from '../components/AuthRightPanel/AuthRightPanel';
import { FloatingAuthModal } from '../components/FloatingAuthModal/FloatingAuthModal';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

interface AuthProps {
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

export const Auth = ({ asModal = false, isOpen = true, onClose, initialMode }: AuthProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine initial mode from URL or prop
  const getInitialMode = (): 'login' | 'register' => {
    if (initialMode) return initialMode;
    const path = location.pathname;
    if (path.includes('register')) return 'register';
    return 'login';
  };

  const [mode, setMode] = useState<'login' | 'register'>(getInitialMode());

  // Redirect if already logged in (only for standalone mode)
  useEffect(() => {
    if (user && !asModal) {
      navigate('/app');
    }
  }, [user, navigate, asModal]);

  // Update URL when mode changes (only for standalone mode)
  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    if (!asModal) {
      navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
    }
  };

  const handleSuccess = () => {
    if (asModal && onClose) {
      onClose();
    }
    navigate('/app');
  };

  // Render as modal
  if (asModal) {
    return (
      <FloatingAuthModal
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        mode={mode}
        onModeChange={handleModeChange}
        onSuccess={handleSuccess}
      />
    );
  }

  // Render as standalone page
  return (
    <div className="auth-split-container">
      <AuthLeftPanel mode={mode} />
      <AuthRightPanel mode={mode} onModeChange={handleModeChange} onSuccess={handleSuccess} />
    </div>
  );
};
