import { IsString, IsNotEmpty, IsObject, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';

export class CreateExperimentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsNotEmpty()
  variants: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  trafficAllocation: Record<string, number>;

  @IsString()
  @IsNotEmpty()
  successMetric: string;

  @IsNumber()
  @IsOptional()
  @Min(10)
  minimumSampleSize?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.8)
  @Max(0.99)
  confidenceLevel?: number;
}
