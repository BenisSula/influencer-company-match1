import { IsOptional, IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class VisitorTrackingDto {
  @IsString()
  @MaxLength(50)
  section: string;

  @IsString()
  @MaxLength(50)
  action: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  visitorId?: string;
}

export class ActivityTrackingDto {
  @IsString()
  @MaxLength(50)
  type: string; // 'match', 'collaboration', 'signup'

  @IsString()
  @MaxLength(100)
  userName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  isVerified?: boolean;

  @IsOptional()
  isPublic?: boolean;
}

export class ROICalculationDto {
  @IsNumber()
  @Min(0)
  campaignBudget: number;

  @IsNumber()
  @Min(0)
  followers: number;

  @IsNumber()
  @Min(0)
  engagementRate: number;

  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  postsPerMonth?: number;
}
