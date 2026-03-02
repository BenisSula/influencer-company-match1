import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, IsEmail, Min, Max } from 'class-validator';

export class UpdateUserProfileDto {
  // Basic user fields
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  // Common profile fields
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // Influencer-specific fields
  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  audienceSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  engagementRate?: number;

  @IsOptional()
  @IsArray()
  platforms?: any[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBudget?: number;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  collaborationPreference?: string;

  @IsOptional()
  @IsArray()
  contentType?: string[];

  @IsOptional()
  @IsBoolean()
  verificationStatus?: boolean;

  // Company-specific fields
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAudienceSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAudienceSize?: number;

  @IsOptional()
  @IsArray()
  campaignType?: string[];

  @IsOptional()
  @IsString()
  preferredInfluencerNiches?: string;

  @IsOptional()
  @IsString()
  collaborationDuration?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
