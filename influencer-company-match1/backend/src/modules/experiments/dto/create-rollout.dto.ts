import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { RolloutSchedule } from '../entities/rollout.entity';

export class CreateRolloutDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  modelVersion: string;

  @IsObject()
  @IsNotEmpty()
  schedule: RolloutSchedule;
}
