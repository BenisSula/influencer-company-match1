import { apiClient } from './api-client';

export interface FilterPreset {
  id: string;
  name: string;
  filters: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFilterPresetDto {
  name: string;
  filters: any;
}

class FilterPresetService {
  async getPresets(): Promise<FilterPreset[]> {
    return apiClient.get<FilterPreset[]>('/filter-presets');
  }

  async createPreset(data: CreateFilterPresetDto): Promise<FilterPreset> {
    return apiClient.post<FilterPreset>('/filter-presets', data);
  }

  async updatePreset(id: string, data: Partial<CreateFilterPresetDto>): Promise<FilterPreset> {
    return apiClient.patch<FilterPreset>(`/filter-presets/${id}`, data);
  }

  async deletePreset(id: string): Promise<void> {
    return apiClient.delete<void>(`/filter-presets/${id}`);
  }
}

export const filterPresetService = new FilterPresetService();
