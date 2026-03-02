import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  experimentId: string;

  @IsString()
  @IsNotEmpty()
  eventType: string;

  @IsObject()
  @IsOptional()
  eventData?: Record<string, any>;
}
