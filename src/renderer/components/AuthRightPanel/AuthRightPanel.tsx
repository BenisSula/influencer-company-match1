import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import './AuthRightPanel.css';

interface AuthRightPanelProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onSuccess?: () => void;
}

export const AuthRightPanel = ({ mode, onModeChange, onSuccess }: AuthRightPanelProps) => {
  return (
    <div className="auth-right-panel">
      <div className="auth-right-content">
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => onModeChange('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => onModeChange('register')}
          >
            Create Account
          </button>
        </div>
        
        {mode === 'login' ? (
          <LoginForm onSuccess={onSuccess} />
        ) : (
          <RegisterForm onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
};
