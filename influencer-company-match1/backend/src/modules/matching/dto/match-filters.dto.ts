import {
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MatchFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niches?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minAudienceSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxAudienceSize?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minEngagementRate?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  verifiedOnly?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collaborationPreferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companySizes?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['score', 'audienceSize', 'engagementRate', 'recentActivity'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
