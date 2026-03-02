import { useState, useCallback } from 'react';
import { filterPresetService, FilterPreset, CreateFilterPresetDto } from '../services/filter-preset.service';

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filterPresetService.getPresets();
      setPresets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load filter presets');
      console.error('Error fetching presets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreset = useCallback(
    async (name: string, filters: any) => {
      setLoading(true);
      setError(null);
      try {
        const data = await filterPresetService.createPreset({ name, filters });
        setPresets((prev) => [data, ...prev]);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to save filter preset';
        setError(errorMessage);
        console.error('Error saving preset:', err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updatePreset = useCallback(
    async (id: string, name: string, filters: any) => {
      setLoading(true);
      setError(null);
      try {
        const data = await filterPresetService.updatePreset(id, { name, filters });
        setPresets((prev) =>
          prev.map((preset) => (preset.id === id ? data : preset)),
        );
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update filter preset';
        setError(errorMessage);
        console.error('Error updating preset:', err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deletePreset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await filterPresetService.deletePreset(id);
      setPresets((prev) => prev.filter((preset) => preset.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete filter preset';
      setError(errorMessage);
      console.error('Error deleting preset:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPresetById = useCallback(
    (id: string) => {
      return presets.find((preset) => preset.id === id);
    },
    [presets],
  );

  return {
    presets,
    loading,
    error,
    fetchPresets,
    savePreset,
    updatePreset,
    deletePreset,
    getPresetById,
  };
}
