import { IsString, IsEmail, IsEnum, IsOptional, IsArray, MinLength } from 'class-validator';
import { AdminRole } from '../entities/admin-user.entity';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEnum(AdminRole)
  role: AdminRole;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];
}
