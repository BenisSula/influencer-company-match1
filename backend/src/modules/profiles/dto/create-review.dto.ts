import { IsInt, IsString, IsOptional, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  communicationRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  professionalismRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  timelinessRating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  collaborationType?: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsUUID()
  connectionId?: string;
}
