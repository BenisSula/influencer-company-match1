import { IsString, IsArray, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  subject: string;

  @IsString()
  htmlContent: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @IsOptional()
  @IsObject()
  metadata?: {
    category: string;
    description: string;
    previewText: string;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsObject()
  metadata?: {
    category: string;
    description: string;
    previewText: string;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
