import { IsString, IsIn } from 'class-validator';
import { ApplicationStatus } from '../entities/campaign-application.entity';

export class UpdateApplicationDto {
  @IsString()
  @IsIn([ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED])
  status: ApplicationStatus;
}
