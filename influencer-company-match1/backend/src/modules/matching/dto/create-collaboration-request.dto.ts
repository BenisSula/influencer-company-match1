import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsDateString, Min, IsNotEmpty } from 'class-validator';
import { CollaborationType } from '../entities/connection.entity';

export class CreateCollaborationRequestDto {
  @IsString()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  // Project Information
  @IsOptional()
  @IsString()
  projectTitle?: string;

  @IsOptional()
  @IsString()
  projectDescription?: string;

  // Budget
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  // Timeline
  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Deliverables & Platforms
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  // Type
  @IsOptional()
  @IsEnum(CollaborationType)
  collaborationType?: CollaborationType;

  // Additional
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
