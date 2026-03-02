import { useState, useEffect } from 'react';
import { SearchResult } from '../services/search.service';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = (maxItems: number = MAX_HISTORY_ITEMS) => {
  const [history, setHistory] = useState<SearchResult[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, [maxItems]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [history]);

  const addToHistory = (result: SearchResult) => {
    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.id !== result.id);
      
      // Add to beginning and limit to maxItems
      const updated = [result, ...filtered].slice(0, maxItems);
      
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};
