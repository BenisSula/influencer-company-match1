import { IsString, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
