import React from 'react';
import './ScoreThresholdSlider.css';

interface ScoreThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const ScoreThresholdSlider: React.FC<ScoreThresholdSliderProps> = ({
  value,
  onChange,
}) => {
  const presets = [
    { label: 'All', value: 0 },
    { label: 'Fair+', value: 40 },
    { label: 'Good+', value: 60 },
    { label: 'Excellent+', value: 75 },
    { label: 'Perfect', value: 90 },
  ];

  const getTierLabel = (score: number) => {
    if (score >= 90) return 'Perfect';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'All';
  };

  const getTierColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#3B82F6'; // Blue
    if (score >= 60) return '#F59E0B'; // Yellow
    if (score >= 40) return '#6B7280'; // Gray
    return '#9CA3AF'; // Light gray
  };

  return (
    <div className="score-threshold-slider">
      <div className="slider-header">
        <label className="slider-label">Minimum Match Score</label>
        <span className="slider-value">
          {value}% 
          <span 
            className="tier-badge" 
            style={{ backgroundColor: getTierColor(value) }}
          >
            {getTierLabel(value)}
          </span>
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="slider-input"
        style={{
          background: `linear-gradient(to right, ${getTierColor(value)} 0%, ${getTierColor(value)} ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`
        }}
      />

      <div className="slider-presets">
        {presets.map((preset) => (
          <button
            key={preset.value}
            className={`preset-button ${value === preset.value ? 'active' : ''}`}
            onClick={() => onChange(preset.value)}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
