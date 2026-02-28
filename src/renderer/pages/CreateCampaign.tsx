import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { campaignsService } from '../services/campaigns.service';
import { CreateCampaignData, CampaignStatus } from '../types/campaign.types';
import { Button } from '../components/Button/Button';
import './CreateCampaign.css';

type Step = 1 | 2 | 3;

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignData>({
    title: '',
    description: '',
    requirements: '',
    budgetMin: undefined,
    budgetMax: undefined,
    niche: '',
    platforms: [],
    deliverables: '',
    status: CampaignStatus.DRAFT,
    startDate: '',
    endDate: '',
    applicationDeadline: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title || formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      }
      if (!formData.description || formData.description.length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      }
    }

    if (step === 2) {
      if (formData.budgetMin && formData.budgetMax && formData.budgetMin > formData.budgetMax) {
        newErrors.budget = 'Minimum budget cannot be greater than maximum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(3, prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateStep(3)) return;

    try {
      setSaving(true);
      const data = {
        ...formData,
        status: isDraft ? CampaignStatus.DRAFT : CampaignStatus.ACTIVE,
      };

      const campaign = await campaignsService.createCampaign(data);
      showToast(
        isDraft ? 'Campaign saved as draft' : 'Campaign published successfully!',
        'success'
      );
      navigate(`/campaigns/${campaign.id}`);
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      showToast(error.message || 'Failed to create campaign', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof CreateCampaignData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const togglePlatform = (platform: string) => {
    const current = formData.platforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    updateField('platforms', updated);
  };

  return (
    <div className="create-campaign-page">
      <div className="create-campaign-container">
        <div className="create-campaign-header">
          <h1>Create Campaign</h1>
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Basic Info</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Requirements</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Timeline</span>
            </div>
          </div>
        </div>

        <div className="create-campaign-content">
          {currentStep === 1 && (
            <div className="wizard-step">
              <h2>Basic Information</h2>
              <p className="step-description">Tell us about your campaign</p>

              <div className="form-group">
                <label>Campaign Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Summer Fashion Collection Launch"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your campaign goals, target audience, and what you're looking for..."
                  rows={6}
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label>Campaign Goals</label>
                <textarea
                  value={formData.requirements || ''}
                  onChange={(e) => updateField('requirements', e.target.value)}
                  placeholder="What are your specific goals? (e.g., brand awareness, product launch, engagement)"
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="wizard-step">
              <h2>Requirements</h2>
              <p className="step-description">Define what you're looking for</p>

              <div className="form-group">
                <label>Niche</label>
                <select
                  value={formData.niche || ''}
                  onChange={(e) => updateField('niche', e.target.value)}
                >
                  <option value="">Select a niche</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Tech">Tech</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>

              <div className="form-group">
                <label>Platforms</label>
                <div className="platform-checkboxes">
                  {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'].map((platform) => (
                    <label key={platform} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.platforms?.includes(platform) || false}
                        onChange={() => togglePlatform(platform)}
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Budget Range</label>
                <div className="budget-inputs">
                  <input
                    type="number"
                    placeholder="Min ($)"
                    value={formData.budgetMin || ''}
                    onChange={(e) => updateField('budgetMin', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max ($)"
                    value={formData.budgetMax || ''}
                    onChange={(e) => updateField('budgetMax', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                {errors.budget && <span className="error-message">{errors.budget}</span>}
              </div>

              <div className="form-group">
                <label>Deliverables</label>
                <textarea
                  value={formData.deliverables || ''}
                  onChange={(e) => updateField('deliverables', e.target.value)}
                  placeholder="What do you expect? (e.g., 3 Instagram posts, 1 YouTube video, 5 stories)"
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="wizard-step">
              <h2>Timeline</h2>
              <p className="step-description">Set important dates</p>

              <div className="form-group">
                <label>Campaign Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Campaign End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  value={formData.applicationDeadline || ''}
                  onChange={(e) => updateField('applicationDeadline', e.target.value)}
                />
                <small>Last date for influencers to apply</small>
              </div>
            </div>
          )}
        </div>

        <div className="create-campaign-actions">
          <div className="actions-left">
            <Button variant="secondary" onClick={() => navigate('/campaigns')}>
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="actions-right">
            {currentStep < 3 ? (
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                >
                  {saving ? 'Publishing...' : 'Publish Campaign'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
