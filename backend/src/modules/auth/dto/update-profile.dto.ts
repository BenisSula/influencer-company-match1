import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  // Influencer fields
  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsNumber()
  audienceSize?: number;

  @IsOptional()
  @IsNumber()
  engagementRate?: number;

  @IsOptional()
  @IsArray()
  platforms?: string[];

  @IsOptional()
  @IsNumber()
  minBudget?: number;

  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  collaborationPreference?: string;

  // Company fields
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsNumber()
  minAudienceSize?: number;

  @IsOptional()
  @IsNumber()
  maxAudienceSize?: number;

  @IsOptional()
  @IsArray()
  preferredNiches?: string[];

  @IsOptional()
  @IsArray()
  campaignType?: string[];

  @IsOptional()
  @IsString()
  preferredInfluencerNiches?: string;

  @IsOptional()
  @IsString()
  collaborationDuration?: string;
}
