import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsIn,
  ValidateNested,
  ArrayMinSize,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for media items in the gallery
 */
export class MediaItemDto {
  @IsString()
  id: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsIn(['image', 'video'])
  type: 'image' | 'video';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  @Min(0)
  @Max(10485760) // 10MB in bytes
  fileSize: number;
}

/**
 * DTO for updating influencer profile
 * All fields are optional to support partial updates
 */
export class UpdateInfluencerProfileDto {
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
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsString()
  location?: string;

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
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  // Phase 1: Enhanced Profile Fields

  /**
   * Content types the influencer creates
   * Must be non-empty array when provided
   * Validates: Requirements 1.1.2
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one content type must be selected' })
  @IsString({ each: true })
  @IsIn(['video', 'image', 'blog', 'podcast', 'story', 'reel', 'livestream'], {
    each: true,
    message: 'Invalid content type',
  })
  contentType?: string[];

  /**
   * Collaboration preference
   * Validates: Requirements 1.1.3
   */
  @IsOptional()
  @IsString()
  @IsIn(['one-time', 'long-term', 'flexible'], {
    message: 'Collaboration preference must be one-time, long-term, or flexible',
  })
  collaborationPreference?: string;

  /**
   * Media gallery with nested validation
   * Validates: Requirements 1.1.6
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  mediaGallery?: MediaItemDto[];
}
