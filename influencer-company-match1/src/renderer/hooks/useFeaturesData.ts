import { useState, useEffect } from 'react';
import { featuresService, PlatformMetrics, ComparisonFeature } from '../services/features.service';

interface FeaturesDataState {
  metrics: PlatformMetrics | null;
  comparisons: ComparisonFeature[];
  loading: boolean;
  error: string | null;
}

export const useFeaturesData = () => {
  const [data, setData] = useState<FeaturesDataState>({
    metrics: null,
    comparisons: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const [metrics, comparisons] = await Promise.all([
          featuresService.getPlatformMetrics(),
          featuresService.getComparisons()
        ]);

        setData({
          metrics,
          comparisons,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading features:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load features data'
        }));
      }
    };

    // Initial load
    loadFeatures();
    
    // Auto-refresh every 30 seconds for live data
    const refreshInterval = setInterval(() => {
      loadFeatures();
    }, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const refetch = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [metrics, comparisons] = await Promise.all([
        featuresService.getPlatformMetrics(),
        featuresService.getComparisons()
      ]);

      setData({
        metrics,
        comparisons,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error refetching features:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load features data'
      }));
    }
  };

  return {
    ...data,
    refetch
  };
};
