import { IsString, IsNotEmpty, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MatchFiltersDto } from './match-filters.dto';

export class CreateFilterPresetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ValidateNested()
  @Type(() => MatchFiltersDto)
  filters: Partial<MatchFiltersDto>;
}
