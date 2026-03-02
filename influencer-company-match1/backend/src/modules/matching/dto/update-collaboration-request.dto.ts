import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CollaborationStatus } from '../entities/connection.entity';

export class UpdateCollaborationRequestDto {
  @IsEnum(CollaborationStatus)
  status: CollaborationStatus;

  @IsOptional()
  @IsString()
  responseMessage?: string;
}
