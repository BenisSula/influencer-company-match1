import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.adminAuthService.login(email, password, ipAddress);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async getProfile(@Req() req: any) {
    return req.adminUser;
  }
}
