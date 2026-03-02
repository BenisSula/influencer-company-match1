import { IsString, IsOptional, IsInt, MinLength, Min } from 'class-validator';

export class ApplyCampaignDto {
  @IsString()
  @MinLength(50)
  proposal: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  proposedRate?: number;
}
