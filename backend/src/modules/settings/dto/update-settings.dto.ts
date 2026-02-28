import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  // Privacy Settings
  @IsOptional()
  @IsString()
  profileVisibility?: string;

  @IsOptional()
  @IsBoolean()
  showInSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  showActivityStatus?: boolean;

  @IsOptional()
  @IsString()
  messagePermission?: string;

  @IsOptional()
  @IsString()
  emailVisibility?: string;

  // Notification Settings
  @IsOptional()
  @IsBoolean()
  emailNewMatch?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNewMessage?: boolean;

  @IsOptional()
  @IsBoolean()
  emailConnectionRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPostInteractions?: boolean;

  @IsOptional()
  @IsBoolean()
  emailWeeklySummary?: boolean;

  @IsOptional()
  @IsBoolean()
  emailMarketing?: boolean;

  // Communication Settings
  @IsOptional()
  @IsBoolean()
  readReceipts?: boolean;

  @IsOptional()
  @IsBoolean()
  typingIndicators?: boolean;

  // Preferences
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
