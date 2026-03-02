import { adminApiClient } from './admin-api-client';

export interface BrandingSettings {
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  infoColor: string;
  fontFamily: string;
  platformName: string;
  tagline: string;
  footerText: string;
  customCSS: string;
}

export interface FeatureFlags {
  enableCampaigns: boolean;
  enableMessaging: boolean;
  enableFeed: boolean;
  enableAIMatching: boolean;
  enableAnalytics: boolean;
  enableReviews: boolean;
  enableSearch: boolean;
  enableNotifications: boolean;
  enableCollaborations: boolean;
}

export interface Integration {
  enabled: boolean;
  [key: string]: any;
}

export interface Integrations {
  stripe: Integration;
  sendgrid: Integration;
  aws: Integration;
  google: Integration;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  metadata?: {
    category: string;
    description: string;
    previewText: string;
  };
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

class AdminBrandingService {
  // Branding APIs
  async getBranding(): Promise<BrandingSettings> {
    return await adminApiClient.get<BrandingSettings>('/admin/customization/branding');
  }

  async updateBranding(data: Partial<BrandingSettings>): Promise<BrandingSettings> {
    const response = await adminApiClient.patch<{ branding: BrandingSettings }>('/admin/customization/branding', data);
    return response.branding;
  }

  async uploadAsset(file: File, type: 'logo' | 'favicon'): Promise<string> {
    const response = await adminApiClient.uploadFile<{ url: string }>(`/admin/customization/upload-asset/${type}`, file);
    return response.url;
  }

  // Feature Flags APIs
  async getFeatures(): Promise<FeatureFlags> {
    return await adminApiClient.get<FeatureFlags>('/admin/customization/features');
  }

  async updateFeatures(data: Partial<FeatureFlags>): Promise<FeatureFlags> {
    const response = await adminApiClient.patch<{ features: FeatureFlags }>('/admin/customization/features', data);
    return response.features;
  }

  // Integrations APIs
  async getIntegrations(): Promise<Integrations> {
    return await adminApiClient.get<Integrations>('/admin/customization/integrations');
  }

  async updateIntegrations(data: Partial<Integrations>): Promise<Integrations> {
    const response = await adminApiClient.patch<{ integrations: Integrations }>('/admin/customization/integrations', data);
    return response.integrations;
  }

  // Email Templates APIs
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await adminApiClient.get<EmailTemplate[]>('/admin/customization/email-templates');
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate> {
    return await adminApiClient.get<EmailTemplate>(`/admin/customization/email-templates/${id}`);
  }

  async createEmailTemplate(data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    return await adminApiClient.post<EmailTemplate>('/admin/customization/email-templates', data);
  }

  async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return await adminApiClient.patch<EmailTemplate>(`/admin/customization/email-templates/${id}`, data);
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await adminApiClient.delete<void>(`/admin/customization/email-templates/${id}`);
  }

  async initDefaultTemplates(): Promise<void> {
    await adminApiClient.post<void>('/admin/customization/email-templates/init-defaults', {});
  }
}

export default new AdminBrandingService();
