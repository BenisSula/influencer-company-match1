import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { TenantStatus, SubscriptionTier } from '../entities/tenant.entity';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsEnum(SubscriptionTier)
  @IsOptional()
  subscriptionTier?: SubscriptionTier;

  @IsObject()
  @IsOptional()
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    customCss?: string;
  };

  @IsObject()
  @IsOptional()
  features?: {
    maxUsers?: number;
    maxMatches?: number;
    aiMatching?: boolean;
    analytics?: boolean;
    customBranding?: boolean;
    apiAccess?: boolean;
  };

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
