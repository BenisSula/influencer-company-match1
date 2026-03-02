import { IsString, IsOptional, IsObject, IsHexColor, IsUrl } from 'class-validator';

export class UpdateBrandingDto {
  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsUrl()
  favicon?: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @IsHexColor()
  successColor?: string;

  @IsOptional()
  @IsHexColor()
  warningColor?: string;

  @IsOptional()
  @IsHexColor()
  infoColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  platformName?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsString()
  customCSS?: string;
}

export class UpdateFeaturesDto {
  @IsOptional()
  enableCampaigns?: boolean;

  @IsOptional()
  enableMessaging?: boolean;

  @IsOptional()
  enableFeed?: boolean;

  @IsOptional()
  enableAIMatching?: boolean;

  @IsOptional()
  enableAnalytics?: boolean;

  @IsOptional()
  enableReviews?: boolean;

  @IsOptional()
  enableSearch?: boolean;

  @IsOptional()
  enableNotifications?: boolean;

  @IsOptional()
  enableCollaborations?: boolean;
}

export class UpdateIntegrationsDto {
  @IsOptional()
  @IsObject()
  stripe?: {
    enabled: boolean;
    publicKey?: string;
    secretKey?: string;
  };

  @IsOptional()
  @IsObject()
  sendgrid?: {
    enabled: boolean;
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
  };

  @IsOptional()
  @IsObject()
  aws?: {
    enabled: boolean;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    region?: string;
  };

  @IsOptional()
  @IsObject()
  google?: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
  };
}
