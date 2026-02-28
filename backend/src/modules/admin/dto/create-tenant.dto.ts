import { IsString, IsEmail, IsEnum, IsOptional, IsObject, MinLength, Matches } from 'class-validator';
import { SubscriptionTier } from '../entities/tenant.entity';

export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must contain only lowercase letters, numbers, and hyphens' })
  subdomain: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;

  @IsString()
  adminFullName: string;

  @IsEnum(SubscriptionTier)
  @IsOptional()
  subscriptionTier?: SubscriptionTier;

  @IsObject()
  @IsOptional()
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
}
