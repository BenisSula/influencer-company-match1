import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MediaFileType } from '../entities/media-file.entity';

export class UploadFileDto {
  @IsEnum(MediaFileType)
  fileType: MediaFileType;

  @IsOptional()
  @IsString()
  altText?: string;
}
