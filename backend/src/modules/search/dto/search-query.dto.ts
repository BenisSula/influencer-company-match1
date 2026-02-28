import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsIn(['user', 'post', 'campaign', 'all'])
  type?: string = 'all';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}

export class SearchResultsDto extends SearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsIn(['relevance', 'recent', 'popular'])
  sort?: string = 'relevance';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAudienceSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxAudienceSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minBudget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxBudget?: number;
}

export class TrackSearchDto {
  @IsString()
  query: string;

  @IsString()
  resultType: string;

  @IsInt()
  resultCount: number;
}

export class TrackSearchClickDto {
  @IsString()
  query: string;

  @IsString()
  resultId: string;
}
