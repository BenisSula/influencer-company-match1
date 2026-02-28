import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiDollarSign, FiUsers, FiTarget, FiClock, FiLock } from 'react-icons/fi';
import { AnimatedStatCounter } from './AnimatedStatCounter';
import { StatMicroChart } from './StatMicroChart';
import { landingService, type ROIResult } from '../../services/landing.service';
import {
  niches,
  followerPresets,
  type CalculatorInputs
} from '../../data/landing/calculator';
import './ROICalculator.css';

interface ROICalculatorProps {
  onCalculate?: (results: ROIResult) => void;
  onSignupClick?: () => void;
  showFullResults?: boolean;
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({
  onCalculate,
  onSignupClick,
  showFullResults = false
}) => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    followerCount: 10000,
    engagementRate: 3,
    niche: 'lifestyle',
    postsPerMonth: 12
  });

  const [results, setResults] = useState<ROIResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced calculation using backend
  useEffect(() => {
    setIsCalculating(true);
    setError(null);
    
    const timer = setTimeout(async () => {
      try {
        // Calculate campaign budget based on posts per month and follower count
        const campaignBudget = inputs.postsPerMonth * (inputs.followerCount / 1000) * 10;
        
        const calculatedResults = await landingService.calculateROI({
          campaignBudget,
          followers: inputs.followerCount,
          engagementRate: inputs.engagementRate,
          niche: inputs.niche, // NOW SENDING NICHE
          postsPerMonth: inputs.postsPerMonth // NOW SENDING POSTS PER MONTH
        });
        
        setResults(calculatedResults);
        onCalculate?.(calculatedResults);
      } catch (err) {
        console.error('ROI calculation error:', err);
        setError('Failed to calculate ROI. Please try again.');
      } finally {
        setIsCalculating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputs, onCalculate]);

  const handleInputChange = useCallback((field: keyof CalculatorInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePresetClick = useCallback((value: number) => {
    handleInputChange('followerCount', value);
  }, [handleInputChange]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <div className="roi-calculator">
      <div className="roi-calculator__header">
        <FiDollarSign className="roi-calculator__icon" />
        <h3 className="roi-calculator__title">Calculate Your Campaign ROI</h3>
        <p className="roi-calculator__subtitle">
          See how much you could save and earn with our platform
        </p>
      </div>

      <div className="roi-calculator__content">
        {/* Input Section */}
        <div className="roi-calculator__inputs">
          {/* Follower Count */}
          <div className="calculator-input">
            <label className="calculator-input__label">
              <FiUsers className="calculator-input__icon" />
              Follower Count
            </label>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="1000"
              value={inputs.followerCount}
              onChange={(e) => handleInputChange('followerCount', parseInt(e.target.value))}
              className="calculator-input__slider"
            />
            <div className="calculator-input__value">
              {formatNumber(inputs.followerCount)}
            </div>
            <div className="calculator-input__presets">
              {followerPresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`calculator-input__preset ${
                    inputs.followerCount === preset.value ? 'calculator-input__preset--active' : ''
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="calculator-input">
            <label className="calculator-input__label">
              <FiTrendingUp className="calculator-input__icon" />
              Engagement Rate
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={inputs.engagementRate}
              onChange={(e) => handleInputChange('engagementRate', parseFloat(e.target.value))}
              className="calculator-input__slider"
            />
            <div className="calculator-input__value">
              {inputs.engagementRate.toFixed(1)}%
            </div>
            <div className="calculator-input__hint">
              {inputs.engagementRate >= 5 && 'Excellent! 🔥'}
              {inputs.engagementRate >= 3 && inputs.engagementRate < 5 && 'Great! 👍'}
              {inputs.engagementRate >= 2 && inputs.engagementRate < 3 && 'Good 👌'}
              {inputs.engagementRate < 2 && 'Room for improvement 📈'}
            </div>
          </div>

          {/* Niche */}
          <div className="calculator-input">
            <label className="calculator-input__label">
              <FiTarget className="calculator-input__icon" />
              Your Niche
            </label>
            <select
              value={inputs.niche}
              onChange={(e) => handleInputChange('niche', e.target.value)}
              className="calculator-input__select"
            >
              {niches.map(niche => (
                <option key={niche.value} value={niche.value}>
                  {niche.label}
                </option>
              ))}
            </select>
          </div>

          {/* Posts Per Month */}
          <div className="calculator-input">
            <label className="calculator-input__label">
              <FiClock className="calculator-input__icon" />
              Posts Per Month
            </label>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={inputs.postsPerMonth}
              onChange={(e) => handleInputChange('postsPerMonth', parseInt(e.target.value))}
              className="calculator-input__slider"
            />
            <div className="calculator-input__value">
              {inputs.postsPerMonth} posts
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="roi-calculator__results">
          {isCalculating ? (
            <div className="roi-calculator__loading">
              <div className="roi-calculator__spinner" />
              <p>Calculating your potential...</p>
            </div>
          ) : error ? (
            <div className="roi-calculator__error">
              <p>{error}</p>
            </div>
          ) : results ? (
            <>
              {/* Platform Cost Savings */}
              <div className="roi-result roi-result--primary">
                <div className="roi-result__header">
                  <FiDollarSign className="roi-result__icon" />
                  <h4 className="roi-result__title">You Save</h4>
                </div>
                <div className="roi-result__value">
                  <AnimatedStatCounter
                    end={results.savings}
                    prefix="$"
                    duration={1000}
                  />
                </div>
                <div className="roi-result__range">
                  {results.savingsPercentage.toFixed(1)}% less than traditional platforms
                </div>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <StatMicroChart
                    data={[
                      results.traditionalCost,
                      results.ourPlatformCost,
                      results.savings
                    ]}
                    color="var(--color-success)"
                  />
                </div>
              </div>

              {/* Estimated Reach */}
              <div className="roi-result">
                <div className="roi-result__header">
                  <FiUsers className="roi-result__icon" />
                  <h4 className="roi-result__title">Estimated Reach</h4>
                </div>
                <div className="roi-result__value">
                  <AnimatedStatCounter
                    end={results.estimatedReach}
                    duration={1000}
                  />
                </div>
                <div className="roi-result__hint">
                  Based on {inputs.engagementRate}% engagement rate
                </div>
              </div>

              {/* Conversions */}
              <div className="roi-result">
                <div className="roi-result__header">
                  <FiTarget className="roi-result__icon" />
                  <h4 className="roi-result__title">Expected Conversions</h4>
                </div>
                <div className="roi-result__value">
                  <AnimatedStatCounter
                    end={results.conversions}
                    duration={1000}
                  />
                </div>
                <div className="roi-result__hint">
                  {results.breakdown.conversionRate}% conversion rate
                </div>
              </div>

              {/* Revenue */}
              <div className="roi-result">
                <div className="roi-result__header">
                  <FiTrendingUp className="roi-result__icon" />
                  <h4 className="roi-result__title">Estimated Revenue</h4>
                </div>
                <div className="roi-result__value">
                  <AnimatedStatCounter
                    end={results.revenue}
                    prefix="$"
                    duration={1000}
                  />
                </div>
              </div>

              {/* ROI */}
              <div className="roi-result roi-result--highlight">
                <div className="roi-result__header">
                  <FiDollarSign className="roi-result__icon" />
                  <h4 className="roi-result__title">Return on Investment (ROI)</h4>
                </div>
                <div className="roi-result__value">
                  <AnimatedStatCounter
                    end={results.roi}
                    suffix="%"
                    duration={1000}
                  />
                </div>
                <div className="roi-result__progress">
                  <div
                    className="roi-result__progress-bar"
                    style={{ width: `${Math.min(results.roi, 100)}%` }}
                  />
                </div>
              </div>

              {/* Locked Results (if not signed up) */}
              {!showFullResults && (
                <div className="roi-result roi-result--locked">
                  <div className="roi-result__lock-overlay">
                    <FiLock className="roi-result__lock-icon" />
                    <h4 className="roi-result__lock-title">Unlock Full Potential</h4>
                    <p className="roi-result__lock-text">
                      Sign up to see detailed breakdown, personalized recommendations, and more
                    </p>
                    <button
                      onClick={onSignupClick}
                      className="roi-result__unlock-btn"
                    >
                      Sign Up Free
                    </button>
                  </div>
                  <div className="roi-result__locked-content">
                    <div className="roi-result__locked-item">
                      <FiTrendingUp />
                      <span>Detailed Cost Breakdown</span>
                    </div>
                    <div className="roi-result__locked-item">
                      <FiClock />
                      <span>Campaign Timeline</span>
                    </div>
                    <div className="roi-result__locked-item">
                      <FiTarget />
                      <span>Personalized Recommendations</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="roi-calculator__footer">
        <p className="roi-calculator__disclaimer">
          * Estimates based on real market data and industry averages. Actual results may vary.
        </p>
      </div>
    </div>
  );
};
