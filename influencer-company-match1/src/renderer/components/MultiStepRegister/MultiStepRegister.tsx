import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Step1AccountCreation } from './Step1AccountCreation';
import { Step2RoleSpecific } from './Step2RoleSpecific';
import { ProgressIndicator } from './ProgressIndicator';
import './MultiStepRegister.css';

interface RegistrationFormData {
  // Step 1 - Common fields
  role: 'INFLUENCER' | 'COMPANY';
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  
  // Step 2 - Influencer fields
  niche: string;
  primaryPlatform: string;
  audienceSizeRange: string;
  
  // Step 2 - Company fields
  industry: string;
  companySize: string;
  budgetRange: string;
  
  // Common optional
  location: string;
}

export const MultiStepRegister = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>({
    // Step 1
    role: 'INFLUENCER',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    
    // Step 2 - Influencer
    niche: '',
    primaryPlatform: '',
    audienceSizeRange: '',
    
    // Step 2 - Company
    industry: '',
    companySize: '',
    budgetRange: '',
    
    // Common
    location: '',
  });

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleFormChange = (newData: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleStep1Submit = () => {
    setStep(2);
  };

  const handleStep2Submit = async () => {
    try {
      // Submit complete registration with role-specific fields
      await register(
        formData.email,
        formData.password,
        formData.role,
        formData.fullName,
        {
          // Influencer fields
          niche: formData.niche || undefined,
          primaryPlatform: formData.primaryPlatform || undefined,
          audienceSizeRange: formData.audienceSizeRange || undefined,
          // Company fields
          industry: formData.industry || undefined,
          companySize: formData.companySize || undefined,
          budgetRange: formData.budgetRange || undefined,
          // Common
          location: formData.location || undefined,
        }
      );
      
      showToast(`Welcome, ${formData.fullName}! 🎉`, 'success');
      
      // Call onSuccess if provided (for modal), otherwise navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      showToast(message, 'error');
    }
  };

  const handleSkipStep2 = async () => {
    try {
      // Register with just Step 1 data
      await register(
        formData.email,
        formData.password,
        formData.role,
        formData.fullName
      );
      
      showToast(`Welcome, ${formData.fullName}! Complete your profile to get better matches.`, 'info');
      
      // Call onSuccess if provided (for modal), otherwise navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      showToast(message, 'error');
    }
  };

  return (
    <div className="multi-step-register">
      <ProgressIndicator currentStep={step} totalSteps={2} />
      
      {step === 1 && (
        <Step1AccountCreation
          data={formData}
          onChange={handleFormChange}
          onNext={handleStep1Submit}
        />
      )}
      
      {step === 2 && (
        <Step2RoleSpecific
          role={formData.role}
          data={formData}
          onChange={handleFormChange}
          onBack={() => setStep(1)}
          onSubmit={handleStep2Submit}
          onSkip={handleSkipStep2}
        />
      )}
    </div>
  );
};
