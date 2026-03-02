import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  IsIn,
  ArrayMinSize,
  IsUrl,
  MaxLength,
} from 'class-validator';

/**
 * DTO for updating company profile
 * All fields are optional to support partial updates
 */
export class UpdateCompanyProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetPlatforms?: string[];

  @IsOptional()
  @IsString()
  targetLocation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAudienceSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAudienceSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  // Phase 1: Enhanced Profile Fields

  /**
   * Company size category
   * Validates: Requirements 1.2.1
   */
  @IsOptional()
  @IsString()
  @IsIn(['startup', 'small', 'medium', 'large', 'enterprise'], {
    message: 'Company size must be startup, small, medium, large, or enterprise',
  })
  companySize?: string;

  /**
   * Campaign types the company runs
   * Must be non-empty array when provided
   * Validates: Requirements 1.2.2
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one campaign type must be selected' })
  @IsString({ each: true })
  @IsIn(
    [
      'product-launch',
      'brand-awareness',
      'event',
      'sponsored-content',
      'affiliate',
      'ambassador',
      'ugc',
    ],
    {
      each: true,
      message: 'Invalid campaign type',
    },
  )
  campaignType?: string[];

  /**
   * Preferred influencer niches
   * Must be non-empty array when provided
   * Validates: Requirements 1.2.7
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one preferred niche must be selected' })
  @IsString({ each: true })
  preferredInfluencerNiches?: string[];

  /**
   * Collaboration duration preference
   * Validates: Requirements 1.2.4
   */
  @IsOptional()
  @IsString()
  @IsIn(['short-term', 'medium-term', 'long-term'], {
    message: 'Collaboration duration must be short-term, medium-term, or long-term',
  })
  collaborationDuration?: string;
}
