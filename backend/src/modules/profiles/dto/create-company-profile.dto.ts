import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';

export class CreateCompanyProfileDto {
  @IsString()
  companyName: string;

  @IsString()
  industry: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsArray()
  @IsString({ each: true })
  targetPlatforms: string[];

  @IsOptional()
  @IsString()
  targetLocation?: string;

  @IsOptional()
  @IsNumber()
  minAudienceSize?: number;

  @IsOptional()
  @IsNumber()
  maxAudienceSize?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
