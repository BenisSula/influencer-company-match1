import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { IsStrongPassword } from '../../../common/validators/password-strength.validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsStrongPassword({
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsEnum(UserRole)
  role: UserRole;

  // Influencer-specific fields (Step 2)
  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsString()
  primaryPlatform?: string;

  @IsOptional()
  @IsString()
  audienceSizeRange?: string;

  // Company-specific fields (Step 2)
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  // Common optional fields
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
