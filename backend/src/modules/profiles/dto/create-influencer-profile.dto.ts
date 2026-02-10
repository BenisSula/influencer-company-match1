import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreateInfluencerProfileDto {
  @IsString()
  niche: string;

  @IsNumber()
  @Min(0)
  audienceSize: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  engagementRate: number;

  @IsArray()
  @IsString({ each: true })
  platforms: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  minBudget?: number;

  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;
}
