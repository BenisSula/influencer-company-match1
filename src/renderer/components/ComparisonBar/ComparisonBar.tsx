import React from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useNavigate } from 'react-router-dom';
import './ComparisonBar.css';

export const ComparisonBar: React.FC = () => {
  const { selectedMatches, clearComparison } = useComparison();
  const navigate = useNavigate();

  console.log('[ComparisonBar] Rendering with selectedMatches:', selectedMatches);

  if (selectedMatches.length === 0) {
    console.log('[ComparisonBar] No matches selected, hiding bar');
    return null;
  }

  const handleCompare = () => {
    console.log('[ComparisonBar] Compare button clicked, navigating to comparison page');
    navigate(`/matches/compare?ids=${selectedMatches.join(',')}`);
  };

  return (
    <div className="comparison-bar">
      <div className="comparison-bar-content">
        <div className="comparison-info">
          <span className="comparison-count">
            {selectedMatches.length} match{selectedMatches.length !== 1 ? 'es' : ''} selected
          </span>
          {selectedMatches.length >= 2 && (
            <span className="comparison-ready">Ready to compare</span>
          )}
        </div>
        
        <div className="comparison-actions">
          <button 
            className="btn-clear" 
            onClick={clearComparison}
          >
            Clear
          </button>
          <button 
            className="btn-compare" 
            onClick={handleCompare}
            disabled={selectedMatches.length < 2}
          >
            Compare Matches
          </button>
        </div>
      </div>
    </div>
  );
};
