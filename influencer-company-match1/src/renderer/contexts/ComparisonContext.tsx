import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ComparisonContextType {
  selectedMatches: string[];
  addToComparison: (matchId: string) => void;
  removeFromComparison: (matchId: string) => void;
  clearComparison: () => void;
  isInComparison: (matchId: string) => boolean;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON = 3;

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  const addToComparison = (matchId: string) => {
    console.log('[ComparisonContext] addToComparison called:', { matchId, currentCount: selectedMatches.length, maxAllowed: MAX_COMPARISON });
    if (selectedMatches.length < MAX_COMPARISON && !selectedMatches.includes(matchId)) {
      const newMatches = [...selectedMatches, matchId];
      console.log('[ComparisonContext] Adding match, new selection:', newMatches);
      setSelectedMatches(newMatches);
    } else {
      console.log('[ComparisonContext] Cannot add - either at max or already included');
    }
  };

  const removeFromComparison = (matchId: string) => {
    console.log('[ComparisonContext] removeFromComparison called:', { matchId });
    const newMatches = selectedMatches.filter(id => id !== matchId);
    console.log('[ComparisonContext] Removing match, new selection:', newMatches);
    setSelectedMatches(newMatches);
  };

  const clearComparison = () => {
    console.log('[ComparisonContext] clearComparison called');
    setSelectedMatches([]);
  };

  const isInComparison = (matchId: string) => {
    return selectedMatches.includes(matchId);
  };

  const canAddMore = selectedMatches.length < MAX_COMPARISON;

  return (
    <ComparisonContext.Provider
      value={{
        selectedMatches,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};
