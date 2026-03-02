import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { SystemSettingsService } from '../services/system-settings.service';

@Controller('admin/system-settings')
@UseGuards(AdminAuthGuard)
export class SystemSettingsController {
  constructor(
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  @Get()
  async getAllSettings() {
    return this.systemSettingsService.getAllSettings();
  }

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    return this.systemSettingsService.getSetting(key);
  }

  @Put(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() body: { value: string; isEncrypted?: boolean },
  ) {
    return this.systemSettingsService.updateSetting(
      key,
      body.value,
      body.isEncrypted,
    );
  }

  @Post('bulk-update')
  async updateMultipleSettings(
    @Body()
    body: {
      settings: Array<{ key: string; value: string; isEncrypted?: boolean }>;
    },
  ) {
    return this.systemSettingsService.updateMultipleSettings(body.settings);
  }

  @Delete(':key')
  async deleteSetting(@Param('key') key: string) {
    return this.systemSettingsService.deleteSetting(key);
  }

  @Get('category/email')
  async getEmailSettings() {
    return this.systemSettingsService.getEmailSettings();
  }

  @Get('category/storage')
  async getStorageSettings() {
    return this.systemSettingsService.getStorageSettings();
  }

  @Get('category/security')
  async getSecuritySettings() {
    return this.systemSettingsService.getSecuritySettings();
  }

  @Get('category/api')
  async getAPISettings() {
    return this.systemSettingsService.getAPISettings();
  }

  @Post('initialize')
  async initializeDefaultSettings() {
    return this.systemSettingsService.initializeDefaultSettings();
  }

  @Post('test-email')
  async testEmail(
    @Body()
    config: {
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPassword: string;
      smtpSecure: boolean;
      emailFrom: string;
      testRecipient: string;
    },
  ) {
    return this.systemSettingsService.testEmailConfiguration(config);
  }

  @Post('test-storage')
  async testStorage(
    @Body()
    config: {
      storageProvider: string;
      s3Bucket?: string;
      s3Region?: string;
      s3AccessKey?: string;
      s3SecretKey?: string;
    },
  ) {
    return this.systemSettingsService.testStorageConfiguration(config);
  }
}
