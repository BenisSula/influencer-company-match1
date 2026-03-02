import { useMemo } from 'react';
import './PasswordStrengthMeter.css';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const feedback: string[] = [];

    // Length
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Unique characters
    const uniqueChars = new Set(password).size;
    if (uniqueChars > 10) score += 10;

    // Determine label and color
    let label = '';
    let color = '';

    if (score < 40) {
      label = 'Weak';
      color = '#EF4444';
    } else if (score < 60) {
      label = 'Fair';
      color = '#F59E0B';
    } else if (score < 80) {
      label = 'Good';
      color = '#10B981';
    } else {
      label = 'Strong';
      color = '#059669';
    }

    return { score: Math.min(score, 100), label, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="password-strength-meter">
      <div className="strength-bar-container">
        <div
          className="strength-bar"
          style={{
            width: `${strength.score}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <div className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </div>
    </div>
  );
};
