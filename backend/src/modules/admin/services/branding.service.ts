import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformConfig } from '../entities/platform-config.entity';
import { Tenant } from '../entities/tenant.entity';
import { UpdateBrandingDto, UpdateFeaturesDto, UpdateIntegrationsDto } from '../dto/update-branding.dto';

@Injectable()
export class BrandingService {
  constructor(
    @InjectRepository(PlatformConfig)
    private platformConfigRepository: Repository<PlatformConfig>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async getOrCreateConfig(tenantId: string): Promise<PlatformConfig> {
    let config = await this.platformConfigRepository.findOne({
      where: { tenantId },
      relations: ['tenant'],
    });

    if (!config) {
      // For super admin with null tenantId, create a default platform config
      if (!tenantId) {
        config = await this.platformConfigRepository.findOne({
          where: { tenantId: null },
        });
        
        if (config) {
          return config;
        }
      }

      // Create default config
      const tenant = tenantId ? await this.tenantRepository.findOne({ where: { id: tenantId } }) : null;
      if (tenantId && !tenant) {
        throw new NotFoundException('Tenant not found');
      }

      config = this.platformConfigRepository.create({
        tenantId,
        branding: {
          logo: '',
          favicon: '',
          primaryColor: '#E1306C',
          secondaryColor: '#5B51D8',
          accentColor: '#FD8D32',
          successColor: '#00D95F',
          warningColor: '#FFCC00',
          infoColor: '#0095F6',
          fontFamily: 'Inter, sans-serif',
          platformName: tenant?.name || 'Platform',
          tagline: 'Connect. Collaborate. Succeed.',
          footerText: `© ${new Date().getFullYear()} ${tenant?.name || 'Platform'}. All rights reserved.`,
          customCSS: '',
        },
        features: {
          enableCampaigns: true,
          enableMessaging: true,
          enableFeed: true,
          enableAIMatching: true,
          enableAnalytics: true,
          enableReviews: true,
          enableSearch: true,
          enableNotifications: true,
          enableCollaborations: true,
        },
        limits: {
          maxUsersPerTenant: 1000,
          maxCampaignsPerUser: 50,
          maxMessagesPerDay: 500,
          maxFileUploadSize: 10,
          maxStoragePerTenant: 100,
          maxConnectionsPerUser: 500,
        },
        integrations: {
          stripe: { enabled: false, publicKey: '', secretKey: '' },
          sendgrid: { enabled: false, apiKey: '', fromEmail: '', fromName: '' },
          aws: { enabled: false, accessKeyId: '', secretAccessKey: '', bucket: '', region: '' },
          google: { enabled: false, clientId: '', clientSecret: '' },
        },
      });

      await this.platformConfigRepository.save(config);
    }

    return config;
  }

  async updateBranding(tenantId: string, dto: UpdateBrandingDto): Promise<PlatformConfig> {
    const config = await this.getOrCreateConfig(tenantId);

    config.branding = {
      ...config.branding,
      ...dto,
    };

    return await this.platformConfigRepository.save(config);
  }

  async updateFeatures(tenantId: string, dto: UpdateFeaturesDto): Promise<PlatformConfig> {
    const config = await this.getOrCreateConfig(tenantId);

    config.features = {
      ...config.features,
      ...dto,
    };

    return await this.platformConfigRepository.save(config);
  }

  async updateIntegrations(tenantId: string, dto: UpdateIntegrationsDto): Promise<PlatformConfig> {
    const config = await this.getOrCreateConfig(tenantId);

    if (dto.stripe) {
      config.integrations.stripe = { ...config.integrations.stripe, ...dto.stripe };
    }
    if (dto.sendgrid) {
      config.integrations.sendgrid = { ...config.integrations.sendgrid, ...dto.sendgrid };
    }
    if (dto.aws) {
      config.integrations.aws = { ...config.integrations.aws, ...dto.aws };
    }
    if (dto.google) {
      config.integrations.google = { ...config.integrations.google, ...dto.google };
    }

    return await this.platformConfigRepository.save(config);
  }

  async uploadAsset(tenantId: string, file: Express.Multer.File, type: 'logo' | 'favicon'): Promise<string> {
    // In production, upload to S3 or cloud storage
    // For now, return a placeholder URL
    const filename = `${tenantId}-${type}-${Date.now()}-${file.originalname}`;
    const url = `/uploads/${filename}`;

    // Update config with new asset URL
    const config = await this.getOrCreateConfig(tenantId);
    if (type === 'logo') {
      config.branding.logo = url;
    } else if (type === 'favicon') {
      config.branding.favicon = url;
    }
    await this.platformConfigRepository.save(config);

    return url;
  }

  async getBranding(tenantId: string) {
    const config = await this.getOrCreateConfig(tenantId);
    return config.branding;
  }

  async getFeatures(tenantId: string) {
    const config = await this.getOrCreateConfig(tenantId);
    return config.features;
  }

  async getIntegrations(tenantId: string) {
    const config = await this.getOrCreateConfig(tenantId);
    // Mask sensitive data
    return {
      stripe: {
        enabled: config.integrations.stripe.enabled,
        publicKey: config.integrations.stripe.publicKey,
        secretKey: config.integrations.stripe.secretKey ? '***' : '',
      },
      sendgrid: {
        enabled: config.integrations.sendgrid.enabled,
        apiKey: config.integrations.sendgrid.apiKey ? '***' : '',
        fromEmail: config.integrations.sendgrid.fromEmail,
        fromName: config.integrations.sendgrid.fromName,
      },
      aws: {
        enabled: config.integrations.aws.enabled,
        accessKeyId: config.integrations.aws.accessKeyId ? '***' : '',
        secretAccessKey: config.integrations.aws.secretAccessKey ? '***' : '',
        bucket: config.integrations.aws.bucket,
        region: config.integrations.aws.region,
      },
      google: {
        enabled: config.integrations.google.enabled,
        clientId: config.integrations.google.clientId,
        clientSecret: config.integrations.google.clientSecret ? '***' : '',
      },
    };
  }
}
