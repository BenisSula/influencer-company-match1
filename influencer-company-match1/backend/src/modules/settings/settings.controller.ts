import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.sub);
  }

  @Put()
  async updateSettings(@Request() req: any, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(req.user.sub, updateSettingsDto);
  }

  @Post('reset')
  async resetSettings(@Request() req: any) {
    return this.settingsService.resetSettings(req.user.sub);
  }

  @Post('change-password')
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.settingsService.changePassword(req.user.sub, changePasswordDto);
  }

  @Post('deactivate')
  async deactivateAccount(@Request() req: any, @Body('password') password: string) {
    return this.settingsService.deactivateAccount(req.user.sub, password);
  }

  @Post('delete')
  async deleteAccount(@Request() req: any, @Body('password') password: string) {
    return this.settingsService.deleteAccount(req.user.sub, password);
  }
}
