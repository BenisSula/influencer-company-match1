import React from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import './ComparisonCheckbox.css';

interface ComparisonCheckboxProps {
  matchId: string;
}

export const ComparisonCheckbox: React.FC<ComparisonCheckboxProps> = ({ matchId }) => {
  const { isInComparison, addToComparison, removeFromComparison, canAddMore } = useComparison();
  
  console.log('[ComparisonCheckbox] Rendering for matchId:', matchId);
  
  const isChecked = isInComparison(matchId);
  const isDisabled = !isChecked && !canAddMore;

  console.log('[ComparisonCheckbox] State:', { matchId, isChecked, isDisabled, canAddMore });

  const handleChange = () => {
    console.log('[ComparisonCheckbox] Checkbox clicked:', { matchId, isChecked, canAddMore });
    if (isChecked) {
      console.log('[ComparisonCheckbox] Removing from comparison');
      removeFromComparison(matchId);
    } else {
      console.log('[ComparisonCheckbox] Adding to comparison');
      addToComparison(matchId);
    }
  };

  return (
    <div className="comparison-checkbox">
      <label className={`checkbox-label ${isDisabled ? 'disabled' : ''}`}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <span className="checkbox-text">Compare</span>
      </label>
      {isDisabled && (
        <span className="checkbox-hint">Max 3 matches</span>
      )}
    </div>
  );
};
